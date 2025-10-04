import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Users,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const HomePage = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Multi-Algorithm ML System",
      description: "Tests 8+ machine learning algorithms and automatically selects the best performer for maximum accuracy.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive risk analysis with detailed probability breakdowns and confidence metrics.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "UCI Dataset Trained",
      description: "Trained on the renowned UCI Heart Disease dataset with 303+ patient samples for reliable predictions.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Predictions",
      description: "Get instant heart disease risk assessments with detailed clinical recommendations.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const stats = [
    { icon: <Target className="w-6 h-6" />, label: "Models Tested", value: "8+", color: "text-blue-600" },
    { icon: <Award className="w-6 h-6" />, label: "Best Accuracy", value: "95%+", color: "text-green-600" },
    { icon: <Database className="w-6 h-6" />, label: "Dataset Size", value: "303+", color: "text-purple-600" },
    { icon: <Users className="w-6 h-6" />, label: "Patient Samples", value: "UCI", color: "text-orange-600" }
  ];

  const steps = [
    {
      number: "01",
      title: "Enter Patient Data",
      description: "Input comprehensive medical parameters including demographics, clinical tests, and advanced features.",
      icon: <Users className="w-6 h-6" />
    },
    {
      number: "02",
      title: "ML Analysis",
      description: "Our system runs multiple algorithms and selects the best-performing model for your specific case.",
      icon: <Brain className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Get Results",
      description: "Receive detailed risk assessment with probabilities, confidence levels, and clinical recommendations.",
      icon: <Target className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-white p-4 rounded-full shadow-xl">
                  <Heart className="w-12 h-12 text-red-500" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              KB22 Enhanced
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Heart Disease</span>
              <br />
              Predictor
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Advanced machine learning system that tests multiple algorithms to provide the most accurate 
              heart disease risk assessment. Built with React, Flask, and cutting-edge ML techniques.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/predict"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group"
              >
                Start Prediction
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our enhanced ML system combines the power of multiple algorithms to deliver unmatched accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our three-step process ensures accurate and reliable heart disease risk assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto border-4 border-blue-100">
                    <div className="text-blue-600">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leveraging cutting-edge frameworks and machine learning libraries for optimal performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "React", description: "Frontend Framework", color: "bg-blue-100 text-blue-800" },
              { name: "Flask", description: "Backend API", color: "bg-green-100 text-green-800" },
              { name: "Scikit-Learn", description: "ML Algorithms", color: "bg-orange-100 text-orange-800" },
              { name: "UCI Dataset", description: "Training Data", color: "bg-purple-100 text-purple-800" }
            ].map((tech, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3 ${tech.color}`}>
                  {tech.name}
                </div>
                <p className="text-gray-600 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experience the power of advanced machine learning for heart disease prediction. 
            Get instant, accurate risk assessments with detailed clinical insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/predict"
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Heart Analysis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-300" />
              <span>No Registration Required</span>
            </div>
            <div className="flex items-center justify-center">
              <Clock className="w-6 h-6 mr-3 text-blue-300" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center justify-center">
              <Shield className="w-6 h-6 mr-3 text-purple-300" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-2xl font-bold">KB22 Heart Disease Predictor</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Advanced machine learning system for heart disease prediction. Built for educational and research purposes.
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © 2024 KB22 Enhanced Heart Disease Predictor. Built with React, Flask, and advanced ML algorithms.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
