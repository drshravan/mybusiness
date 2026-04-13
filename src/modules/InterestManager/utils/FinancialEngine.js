import { differenceInDays, parseISO, isAfter } from 'date-fns';

/**
 * Calculates interest based on rate type and days elapsed.
 * Formula: Interest = (Principal * Rate% * Days) / Period
 * Period is 30 for Monthly, 365 for Yearly.
 */
export const calculateAccruedInterest = (principal, rate, days, rateType) => {
  if (days <= 0 || principal <= 0) return 0;
  const period = rateType === 'YEARLY' ? 365 : 30;
  return (principal * (rate / 100) * days) / period;
};

/**
 * Processes the entire loan history chronologically.
 * @param {Object} loan
 * @param {Array} payments
 * @param {Date|String} asOfDate
 */
export const processLoan = (loan, payments = [], asOfDate = new Date()) => {
  const targetDate = typeof asOfDate === 'string' ? parseISO(asOfDate) : asOfDate;
  
  // Accept both the old structure and the new structure
  const rawStartDate = loan.disbursementDate || loan.startDate;
  const startDate = typeof rawStartDate === 'string' ? parseISO(rawStartDate) : rawStartDate;
  
  const interestRate = loan.interestRate || loan.rate;
  const interestMode = loan.interestMode || loan.rateType;
  
  let currentPrincipal = Number(loan.principal);
  let unpaidInterest = 0;
  let lastEventDate = startDate;
  let totalProfit = 0;
  let totalInterestPaid = 0;
  let transactions = [];

  // Sort payments chronologically
  const sortedPayments = [...payments]
    .map(p => ({ ...p, dateObj: typeof p.date === 'string' ? parseISO(p.date) : p.date }))
    .sort((a, b) => a.dateObj - b.dateObj);

  for (const payment of sortedPayments) {
    if (isAfter(payment.dateObj, targetDate)) break;

    // 1. Accrue interest from last event to this payment date
    const daysSinceLast = differenceInDays(payment.dateObj, lastEventDate);
    const accrued = calculateAccruedInterest(currentPrincipal, interestRate, daysSinceLast, interestMode);
    unpaidInterest += accrued;

    // 2. Apply Payment Logic
    let remainingPayment = Number(payment.amount);
    let appliedToInterest = 0;
    let appliedToPrincipal = 0;
    
    const isDiscount = payment.type === 'DISCOUNT' || payment.discount > 0;

    if (isDiscount) {
      // Step A (Discount): Unpaid Interest first -> then Principal
      appliedToInterest = Math.min(remainingPayment, unpaidInterest);
      unpaidInterest -= appliedToInterest;
      remainingPayment -= appliedToInterest;

      appliedToPrincipal = Math.min(remainingPayment, currentPrincipal);
      currentPrincipal -= appliedToPrincipal;
    } else {
      // Step B (Cash): Unpaid Interest first -> then Principal -> then Profit
      appliedToInterest = Math.min(remainingPayment, unpaidInterest);
      unpaidInterest -= appliedToInterest;
      remainingPayment -= appliedToInterest;
      totalInterestPaid += appliedToInterest;

      appliedToPrincipal = Math.min(remainingPayment, currentPrincipal);
      currentPrincipal -= appliedToPrincipal;
      remainingPayment -= appliedToPrincipal;

      if (remainingPayment > 0) {
        totalProfit += remainingPayment;
      }
    }

    transactions.push({
      date: payment.date,
      type: isDiscount ? 'DISCOUNT' : 'CASH',
      amount: payment.amount,
      interestPortion: appliedToInterest,
      principalPortion: appliedToPrincipal,
      remainingPrincipal: currentPrincipal,
      remainingInterest: unpaidInterest
    });

    lastEventDate = payment.dateObj;
  }

  // 3. Final Accrual from last payment to targetDate
  const finalDays = differenceInDays(targetDate, lastEventDate);
  const finalAccrued = calculateAccruedInterest(currentPrincipal, interestRate, finalDays, interestMode);
  unpaidInterest += finalAccrued;

  return {
    currentPrincipal,
    unpaidInterest,
    totalBalance: currentPrincipal + unpaidInterest,
    totalProfit,
    totalInterestPaid,
    isSettled: (currentPrincipal + unpaidInterest) < 0.5,
    transactions
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0); // Safety fallback
};
