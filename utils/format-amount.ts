export const formatAmount = (amount: string | number) => {
  // Conver to number if string
  const numberAmount =
    typeof amount === 'string'
      ? Number.parseFloat(amount)
      : amount;

  // Format based on magnitude
  if (numberAmount >= 1e9) {
    // Billions
    return `${(numberAmount / 1e9).toFixed(2)}B`;
  } else if (numberAmount >= 1e6) {
    // Millions
    return `${(numberAmount / 1e6).toFixed(2)}M`;
  } else if (numberAmount >= 1e5) {
    // Hundred Thousands
    return `${(numberAmount / 1e3).toFixed(3)}K`;
  } else {
    // Less than hundred thousands
    return `${numberAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};
