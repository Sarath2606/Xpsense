// src/components/ui/BalanceCard.js
import React from 'react';
import { Plus, CreditCard, Sparkles } from 'lucide-react';

const BalanceCard = ({ onAddCard }) => {
  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Glassy Card Container */}
      <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
        
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        {/* Card Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          
          {/* Top Section */}
          <div className="flex items-start justify-between">
            {/* Bank Logo Placeholder */}
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            
            {/* Add Button */}
            <button
              onClick={handleAddCard}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
          </div>
          
          {/* Middle Section */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white/90">Add Bank Card</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect your bank account to track expenses and manage your finances
              </p>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs font-medium">Secure Connection</span>
            </div>
            
            {/* Card Number Placeholder */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default BalanceCard;