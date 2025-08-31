import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const CurrencyConverter = ({ onBack }) => {
  const [fromCurrency, setFromCurrency] = useState('AUD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Popular currency pairs for quick selection
  const popularPairs = [
    { from: 'AUD', to: 'INR', label: 'AUD → INR' },
    { from: 'AUD', to: 'CNY', label: 'AUD → CNY' },
    { from: 'AUD', to: 'USD', label: 'AUD → USD' },
    { from: 'AUD', to: 'EUR', label: 'AUD → EUR' },
    { from: 'USD', to: 'INR', label: 'USD → INR' },
    { from: 'EUR', to: 'INR', label: 'EUR → INR' }
  ];

  // Available currencies
  const currencies = [
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
  ];

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      const rate = data.rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not available for ${toCurrency}`);
      }
      
      setExchangeRate(rate);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('Unable to fetch current exchange rate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (value) => {
    // Only allow numbers and decimal points
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setAmount(sanitizedValue);
  };

  const handleQuickPairSelect = (pair) => {
    setFromCurrency(pair.from);
    setToCurrency(pair.to);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = exchangeRate && amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : '0.00';
  const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency);
  const toCurrencyInfo = currencies.find(c => c.code === toCurrency);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-white font-medium hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold text-white">Currency Converter</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Exchange Rate Display */}
          {exchangeRate && !error && (
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-4 mb-6 border border-blue-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </div>
                <div className="text-sm text-blue-200">
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Converter */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Convert Currency</h3>
            
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Enter amount"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                  {fromCurrencyInfo?.symbol || fromCurrency}
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* From Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex items-end">
                <button
                  onClick={swapCurrencies}
                  className="w-full py-2 px-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Swap
                </button>
              </div>

              {/* To Currency */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Converted Amount</div>
              <div className="text-2xl font-bold text-white">
                {convertedAmount} {toCurrencyInfo?.symbol || toCurrency}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {amount} {fromCurrencyInfo?.name || fromCurrency} = {convertedAmount} {toCurrencyInfo?.name || toCurrency}
              </div>
            </div>
          </div>

          {/* Popular Currency Pairs */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Popular Conversions</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularPairs.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPairSelect(pair)}
                  className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
                    fromCurrency === pair.from && toCurrency === pair.to
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-900 rounded-xl p-4 border border-blue-600">
            <h3 className="font-semibold text-blue-200 mb-3">💡 Exchange Rate Info</h3>
            <div className="space-y-2 text-sm text-blue-300">
              <p>• Rates are updated hourly from reliable sources</p>
              <p>• This is a free service with no hidden fees</p>
              <p>• Rates may vary slightly between different providers</p>
              <p>• For large amounts, consider checking with your bank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
