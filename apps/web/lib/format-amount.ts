export const formatAmount = (amount: string | number) => {
  const numberAmount =
    typeof amount === 'string'
      ? Number.parseFloat(amount)
      : amount;

  if (numberAmount >= 1e9) {
    return `${(numberAmount / 1e9).toFixed(2)}B`;
  } else if (numberAmount >= 1e6) {
    return `${(numberAmount / 1e6).toFixed(2)}M`;
  } else if (numberAmount >= 1e5) {
    return `${(numberAmount / 1e3).toFixed(3)}K`;
  } else {
    return `${numberAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};
