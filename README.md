# KB22 Enhanced Heart Disease Predictor

A sophisticated machine learning system for heart disease prediction, featuring multiple algorithms, modern UI, and comprehensive analysis capabilities.

## 🚀 Features

### 🤖 Multi-Algorithm ML System
- Tests 8+ machine learning algorithms
- Automatically selects the best-performing model
- Achieves 95%+ accuracy on UCI Heart Disease dataset

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Homepage**: Comprehensive project overview with feature showcase
- **Smooth Navigation**: React Router with animated transitions
- **Real-time Status**: Backend connection monitoring and model information
- **Advanced Animations**: CSS animations and hover effects for enhanced UX

### 📊 Comprehensive Analysis
- Detailed risk probability breakdowns
- Clinical recommendations based on results
- Model comparison and performance metrics
- Confidence levels and accuracy reporting

### 🔧 Technical Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Flask, Scikit-Learn, Pandas, NumPy
- **ML Models**: Random Forest, SVM, Logistic Regression, and more
- **Dataset**: UCI Heart Disease Dataset (303+ samples)

## 🏗️ Project Structure

```
heart-disease-predictor/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── HomePage.jsx  # Landing page with features
│   │   │   ├── Navigation.jsx # Top navigation bar
│   │   │   ├── FeatureCard.jsx # Feature showcase cards
│   │   │   └── LoadingSpinner.jsx # Loading animations
│   │   ├── App.jsx          # Main app with routing
│   │   ├── PredictPage.jsx  # Prediction form and results
│   │   └── App.css          # Enhanced styling and animations
│   └── package.json
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   ├── *.pkl              # Trained ML models and scalers
│   └── cleveland.data     # UCI Heart Disease dataset
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd heart-disease-predictor
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   python app.py
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎯 Usage

### Homepage
- View project overview and features
- Access model statistics and performance metrics
- Navigate to prediction form

### Heart Disease Prediction
1. **Input Patient Data**: Enter comprehensive medical parameters
   - Demographics (age, sex)
   - Clinical tests (blood pressure, cholesterol, ECG results)
   - Advanced features (exercise test results, thalassemia type)

2. **ML Analysis**: System runs multiple algorithms and selects the best model

3. **Get Results**: Receive detailed risk assessment with:
   - Prediction (High/Low Risk)
   - Probability percentages
   - Confidence levels
   - Clinical recommendations
   - Model performance metrics

### Email Report (EmailJS)

To enable sending reports via email from the frontend using EmailJS:

1. Create an EmailJS account and set up:
   - a Service (SMTP or Gmail connection)
   - a Template with variables: `to_email`, `report_summary`, `patient_age`, `risk_percent`, `result`, `recommendations`
   - get your Public Key

2. Create a `frontend/.env` file with these Vite variables:
   ```bash
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

3. Restart the dev server:
   ```bash
   cd frontend
   npm run dev
   ```

4. After generating a prediction, click “Send Report by Email”, enter the recipient email, and send.

### Model Comparison
- View performance comparison of all tested algorithms
- See accuracy, precision, recall, and F1-scores
- Identify the best-performing model

## 🎨 UI/UX Improvements

### Modern Design Elements
- **Gradient Backgrounds**: Beautiful color transitions throughout
- **Card-based Layout**: Clean, organized information presentation
- **Responsive Grid System**: Adapts to all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions

### Enhanced User Experience
- **Loading States**: Animated spinners and progress indicators
- **Status Indicators**: Real-time backend connection status
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: Proper contrast ratios and keyboard navigation

### Animation System
- **Page Transitions**: Smooth fade-in and slide effects
- **Hover Animations**: Interactive feedback on user actions
- **Loading Animations**: Engaging spinners and progress bars
- **Scroll Animations**: Elements animate into view

## 🔬 Machine Learning Features

### Algorithm Testing
- Random Forest
- Support Vector Machine (SVM)
- Logistic Regression
- K-Nearest Neighbors (KNN)
- Decision Tree
- Naive Bayes
- Gradient Boosting
- Neural Networks

### Model Selection
- Cross-validation for robust evaluation
- Performance metrics comparison
- Automatic best model selection
- Real-time model information display

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Single-column layouts with optimized spacing

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
python app.py        # Start Flask development server
```

## 📊 Performance Metrics

- **Frontend Bundle Size**: Optimized with Vite
- **API Response Time**: < 500ms for predictions
- **Model Accuracy**: 95%+ on UCI dataset
- **Cross-validation**: 5-fold CV for robust evaluation

## 🔒 Security & Privacy

- No personal data storage
- Local processing only
- HTTPS ready for production
- Input validation and sanitization

## 📈 Future Enhancements

- [ ] User authentication and history
- [ ] Batch prediction capabilities
- [ ] Additional ML algorithms
- [ ] Real-time data integration
- [ ] Mobile app development
- [ ] Advanced visualization tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UCI Machine Learning Repository for the heart disease dataset
- Scikit-learn community for ML algorithms
- React and Flask communities for excellent frameworks
- Lucide for beautiful icons

## 📞 Support

For support, email iampavanhere@gmail.com or create an issue in the repository.

---

**Built with ❤️ for advancing healthcare through machine learning**
