'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, XCircle, Copy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoltBadge } from '@/components/bolt-badge';

interface PasswordAnalysis {
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  feedback: string[];
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    commonWords: boolean;
    repeatedChars: boolean;
    sequential: boolean;
  };
  dictionaryWords: string[];
  entropy: number;
}

const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'master', 'hello', 'login', 'pass', 'admin123', 'root', 'user',
  'test', 'guest', 'info', 'administrator', 'demo', 'sample'
];

const commonWords = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
  'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'love', 'time',
  'work', 'life', 'home', 'good', 'make', 'come', 'know', 'take', 'year',
  'look', 'first', 'never', 'after', 'back', 'other', 'many', 'than',
  'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like',
  'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just',
  'first', 'also', 'after', 'back', 'other', 'many', 'than', 'then'
];

export default function Home() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  const analyzePassword = (pwd: string): PasswordAnalysis => {
    const checks = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd),
      commonWords: true,
      repeatedChars: true,
      sequential: true
    };

    // Check for dictionary words
    const foundWords: string[] = [];
    const lowerPwd = pwd.toLowerCase();
    
    [...commonPasswords, ...commonWords].forEach(word => {
      if (lowerPwd.includes(word.toLowerCase()) && word.length > 2) {
        foundWords.push(word);
        checks.commonWords = false;
      }
    });

    // Check for repeated characters (3+ in a row)
    const repeatedPattern = /(.)\1{2,}/;
    if (repeatedPattern.test(pwd)) {
      checks.repeatedChars = false;
    }

    // Check for sequential characters
    const sequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i;
    if (sequential.test(pwd)) {
      checks.sequential = false;
    }

    // Calculate entropy
    let charsetSize = 0;
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/\d/.test(pwd)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd)) charsetSize += 32;
    
    const entropy = pwd.length * Math.log2(charsetSize || 1);

    // Calculate score
    let score = 0;
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Bonus points for length
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;

    // Penalty for short passwords
    if (pwd.length < 8) score = Math.max(0, score - 2);

    const maxScore = 10;
    const normalizedScore = Math.min(score / maxScore * 100, 100);

    let strength: PasswordAnalysis['strength'];
    if (normalizedScore >= 90) strength = 'Very Strong';
    else if (normalizedScore >= 75) strength = 'Strong';
    else if (normalizedScore >= 60) strength = 'Good';
    else if (normalizedScore >= 40) strength = 'Fair';
    else if (normalizedScore >= 20) strength = 'Weak';
    else strength = 'Very Weak';

    const feedback: string[] = [];
    if (!checks.length) feedback.push('Use at least 12 characters');
    if (!checks.uppercase) feedback.push('Add uppercase letters');
    if (!checks.lowercase) feedback.push('Add lowercase letters');
    if (!checks.numbers) feedback.push('Add numbers');
    if (!checks.symbols) feedback.push('Add special characters');
    if (!checks.commonWords) feedback.push('Avoid common words');
    if (!checks.repeatedChars) feedback.push('Avoid repeated characters');
    if (!checks.sequential) feedback.push('Avoid sequential characters');

    if (feedback.length === 0) {
      feedback.push('Excellent! Your password is very strong.');
    }

    return {
      score: normalizedScore,
      strength,
      feedback,
      checks,
      dictionaryWords: foundWords,
      entropy
    };
  };

  useEffect(() => {
    if (password) {
      setAnalysis(analyzePassword(password));
    } else {
      setAnalysis(null);
    }
  }, [password]);

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let result = '';
    
    // Ensure at least one character from each category
    result += lowercase[Math.floor(Math.random() * lowercase.length)];
    result += uppercase[Math.floor(Math.random() * uppercase.length)];
    result += numbers[Math.floor(Math.random() * numbers.length)];
    result += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      result += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the result
    const shuffled = result.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffled);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password');
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'text-green-600';
      case 'Strong': return 'text-green-500';
      case 'Good': return 'text-blue-500';
      case 'Fair': return 'text-yellow-500';
      case 'Weak': return 'text-orange-500';
      case 'Very Weak': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-green-400';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <BoltBadge />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Strong Password Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Test your password strength with our advanced security analyzer. 
            Get real-time feedback and protect yourself from cyber threats.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Password Input Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter your password to test its strength
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type or paste your password here..."
                    className="w-full px-4 py-4 pr-24 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    {password && (
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                        title="Copy password"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={generatePassword}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Generate Strong Password
                </button>
                
                {copied && (
                  <div className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="p-8">
              <div className="space-y-8">
                {/* Strength Indicator */}
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600">Password Strength</span>
                    <div className={cn("text-3xl font-bold mt-1", getStrengthColor(analysis.strength))}>
                      {analysis.strength}
                    </div>
                    <div className="text-lg text-gray-500 mt-1">
                      {Math.round(analysis.score)}% secure
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500 ease-out", getProgressColor(analysis.score))}
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                </div>

                {/* Security Checks Grid */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Security Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'length', label: 'At least 12 characters', check: analysis.checks.length },
                      { key: 'uppercase', label: 'Uppercase letters (A-Z)', check: analysis.checks.uppercase },
                      { key: 'lowercase', label: 'Lowercase letters (a-z)', check: analysis.checks.lowercase },
                      { key: 'numbers', label: 'Numbers (0-9)', check: analysis.checks.numbers },
                      { key: 'symbols', label: 'Special characters (!@#$)', check: analysis.checks.symbols },
                      { key: 'commonWords', label: 'No common words', check: analysis.checks.commonWords },
                      { key: 'repeatedChars', label: 'No repeated characters', check: analysis.checks.repeatedChars },
                      { key: 'sequential', label: 'No sequential patterns', check: analysis.checks.sequential }
                    ].map(({ key, label, check }) => (
                      <div key={key} className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        {check ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                        <span className={cn("font-medium", check ? "text-green-700" : "text-red-700")}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Stats */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Password Statistics
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Length:</span>
                        <span className="font-semibold text-blue-800">{password.length} characters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Entropy:</span>
                        <span className="font-semibold text-blue-800">{Math.round(analysis.entropy)} bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Character types:</span>
                        <span className="font-semibold text-blue-800">
                          {Object.values(analysis.checks).filter(Boolean).length}/8
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {analysis.feedback.map((item, index) => (
                        <div key={index} className="text-sm text-amber-700 flex items-start">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dictionary Words Warning */}
                {analysis.dictionaryWords.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Security Warning
                    </h4>
                    <p className="text-red-700 mb-3">
                      Your password contains common words that make it vulnerable to dictionary attacks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.dictionaryWords.map((word, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!password && (
            <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Password Security Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Use a mix of characters</h4>
                      <p className="text-gray-600 text-sm">Combine uppercase, lowercase, numbers, and symbols</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Make it long</h4>
                      <p className="text-gray-600 text-sm">Aim for at least 12 characters, preferably 16+</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Avoid common words</h4>
                      <p className="text-gray-600 text-sm">Don't use dictionary words or personal information</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">No patterns</h4>
                      <p className="text-gray-600 text-sm">Avoid sequences like "123" or repeated characters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Your password is analyzed locally in your browser. No data is sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}