function DecimalFormat({ price }) {
    if (price === null) {
      return null; // Or you can return an empty string or any other placeholder you prefer
    }
  
    return parseFloat(price).toFixed(2);
  }
  
  export default DecimalFormat;