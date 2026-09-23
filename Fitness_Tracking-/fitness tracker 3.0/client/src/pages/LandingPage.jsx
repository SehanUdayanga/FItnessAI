import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Sparkles,
  Scale,
  Droplets,
  Utensils,
  TrendingUp,
  Bot,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  Send,
  Flame
} from 'lucide-react';

const LandingPage = () => {
  const [interactiveMsg, setInteractiveMsg] = useState(
    'Based on your current activity level, try gradually increasing your daily activity and maintaining your hydration goal.'
  );
  const [activeQuestion, setActiveQuestion] = useState('I want to improve my fitness.');

  const sampleChats = {
    'I want to improve my fitness.':
      'Based on your current activity level, try gradually increasing your daily activity and maintaining your hydration goal.',
    'How is my daily water intake?':
      'You are currently at 74% of your 2.4L target. Drinking one more 500ml glass will help you hit today’s optimal hydration!',
    'Explain my current BMI score.':
      'Your BMI is 22.4, which sits comfortably within the healthy normal weight range (18.5 - 24.9). Great job maintaining balance!'
  };

  const handlePromptClick = (question) => {
    setActiveQuestion(question);
    setInteractiveMsg(sampleChats[question] || 'FitTrack AI is ready to help you analyze your nutrition and health data.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-700 font-inter selection:bg-green-100 selection:text-green-900">
      {/* ===== STICKY NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-line">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-sora font-bold text-lg text-navy-900 tracking-tight">
            <div className="w-8 h-8 rounded-[9px] bg-green-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            FITTRACK
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-9 text-[14.5px] font-medium text-slate-700">
            <a href="#home" className="hover:text-navy-900 transition-colors">Home</a>
            <a href="#features" className="hover:text-navy-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-navy-900 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-navy-900 transition-colors">About</a>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/login"
              className="text-[14.5px] font-semibold text-navy-900 hover:text-green-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center font-sora font-semibold text-[13px] sm:text-[14px] px-4 sm:px-5 py-2.5 rounded-full bg-green-700 hover:bg-green-600 text-white shadow-[0_8px_20px_rgba(31,111,79,0.25)] hover:shadow-[0_12px_26px_rgba(31,111,79,0.32)] transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative pt-12 pb-24 md:py-24 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-36 -right-36 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-green-100/80 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            {/* Left Column: Copy & Actions */}
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-4">
                <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
                AI-Powered Health Platform
              </div>

              <h1 className="font-sora text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-navy-900 leading-[1.1] mb-6">
                Your Health. Your Progress. <span className="text-green-700">Your FitTrack.</span>
              </h1>

              <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                Track your fitness, nutrition, water intake and health progress in one intelligent platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center font-sora font-semibold text-[15px] px-7 py-3.5 rounded-full bg-green-700 hover:bg-green-600 text-white shadow-[0_10px_24px_rgba(31,111,79,0.28)] hover:shadow-[0_14px_30px_rgba(31,111,79,0.36)] transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center font-sora font-semibold text-[15px] px-7 py-3.5 rounded-full bg-transparent text-navy-900 border-[1.5px] border-line hover:border-navy-900 transition-all transform hover:-translate-y-0.5"
                >
                  Explore Features
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3.5 text-xs sm:text-sm text-slate-500">
                <div className="flex -space-x-2.5">
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-tr from-green-400 to-green-700" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-tr from-teal-400 to-emerald-700" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-tr from-emerald-500 to-navy-900" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-tr from-green-600 to-green-900" />
                </div>
                <span>Trusted by early users building healthier daily routines</span>
              </div>
            </div>

            {/* Right Column: Interactive Dashboard Preview */}
            <div className="bg-white rounded-[24px] border border-line p-5 shadow-lg relative">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-line px-1">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="font-mono text-[11px] font-semibold text-slate-500 tracking-wider">
                  FITTRACK / DASHBOARD
                </div>
                <div className="w-10" />
              </div>

              {/* 4 Mini Cards */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-050 border border-line rounded-[14px] p-3.5 sm:p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">BMI</div>
                  <div className="font-mono text-2xl font-bold text-navy-900 my-1">22.4</div>
                  <div className="text-[11.5px] text-slate-500">Normal range</div>
                </div>

                <div className="bg-navy-900 border border-navy-900 rounded-[14px] p-3.5 sm:p-4 text-white">
                  <div className="text-[11px] font-semibold text-[#A7B4AC] uppercase tracking-wider">Weight</div>
                  <div className="font-mono text-2xl font-bold text-white my-1">68.2 kg</div>
                  <div className="text-[11.5px] text-[#A7B4AC]">−1.3 kg this month</div>
                </div>

                <div className="bg-green-050 border border-line rounded-[14px] p-3.5 sm:p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Water Intake</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-[conic-gradient(#278B62_74%,#E3E9E4_0)]">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span className="font-mono text-[10px] font-bold text-navy-900">74%</span>
                      </div>
                    </div>
                    <div className="text-[11.5px] text-slate-500 font-medium">1.8 / 2.4 L</div>
                  </div>
                </div>

                <div className="bg-green-050 border border-line rounded-[14px] p-3.5 sm:p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Calories</div>
                  <div className="font-mono text-2xl font-bold text-navy-900 my-1">1,860</div>
                  <div className="text-[11.5px] text-slate-500">Goal 2,100 kcal</div>
                </div>
              </div>

              {/* Progress Sparkline Card */}
              <div className="bg-white border border-line rounded-[14px] p-4 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11.5px] font-semibold text-slate-500 uppercase font-mono">Progress · Last 7 Days</span>
                  <span className="font-mono text-[11px] font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">+4.2%</span>
                </div>
                <div className="w-full h-16">
                  <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="w-full h-full">
                    <polyline
                      points="0,55 45,42 90,48 135,30 180,34 225,18 270,22 300,10"
                      fill="none"
                      stroke="#278B62"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="0,55 45,42 90,48 135,30 180,34 225,18 270,22 300,10 300,70 0,70"
                      fill="#EAF4EE"
                      opacity="0.7"
                    />
                  </svg>
                </div>
              </div>

              {/* Today's Activity */}
              <div className="bg-white border border-line rounded-[14px] p-4">
                <div className="text-[11.5px] font-semibold text-slate-500 uppercase font-mono mb-2">Today's Activity</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-line">
                    <div className="flex items-center gap-2 font-medium text-navy-900">
                      <span className="w-2 h-2 rounded-full bg-green-600" />
                      Morning Workout
                    </div>
                    <span className="font-mono text-slate-500">32 min</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1.5 border-b border-line">
                    <div className="flex items-center gap-2 font-medium text-navy-900">
                      <span className="w-2 h-2 rounded-full bg-green-600" />
                      Strength Training
                    </div>
                    <span className="font-mono text-slate-500">410 kcal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-medium text-navy-900">
                      <span className="w-2 h-2 rounded-full bg-green-600" />
                      Daily Steps
                    </div>
                    <span className="font-mono text-slate-500">8,240</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY FITTRACK SECTION ===== */}
      <section className="py-24 bg-white border-y border-line">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-3">
              <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
              Why FitTrack
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              One platform for your whole health picture
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              FitTrack brings tracking, understanding and improvement together — so every number you log turns into a step forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Card 01 */}
            <div className="p-8 rounded-[20px] border border-line bg-[#FAFAF8] hover:bg-green-050 hover:border-green-400 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
              <span className="font-mono text-xs font-bold text-green-700 mb-4 block">01</span>
              <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center mb-6 text-green-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-xl font-bold text-navy-900 mb-2">Track</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Record daily fitness and health activities.
              </p>
            </div>

            {/* Card 02 */}
            <div className="p-8 rounded-[20px] border border-line bg-[#FAFAF8] hover:bg-green-050 hover:border-green-400 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
              <span className="font-mono text-xs font-bold text-green-700 mb-4 block">02</span>
              <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center mb-6 text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-xl font-bold text-navy-900 mb-2">Monitor</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Understand health and progress through meaningful statistics.
              </p>
            </div>

            {/* Card 03 */}
            <div className="p-8 rounded-[20px] border border-line bg-[#FAFAF8] hover:bg-green-050 hover:border-green-400 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
              <span className="font-mono text-xs font-bold text-green-700 mb-4 block">03</span>
              <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center mb-6 text-green-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-sora text-xl font-bold text-navy-900 mb-2">Improve</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Receive personalized recommendations and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-3">
              <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
              Features
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              From daily workouts to AI-guided recommendations, FitTrack keeps every part of your health journey connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-line rounded-[20px] p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-green-400">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-5 text-green-700">
                <Activity className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">FITNESS TRACKING</div>
              <h4 className="font-sora text-lg font-bold text-navy-900 mb-2">Workouts &amp; Activity</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Track workouts and daily physical activities.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-line rounded-[20px] p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-green-400">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-5 text-green-700">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">MEAL TRACKING</div>
              <h4 className="font-sora text-lg font-bold text-navy-900 mb-2">Nutrition Log</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Record meals and monitor nutrition.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-line rounded-[20px] p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-green-400">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-5 text-green-700">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">WATER TRACKING</div>
              <h4 className="font-sora text-lg font-bold text-navy-900 mb-2">Hydration</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Monitor daily hydration and water intake.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-line rounded-[20px] p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-green-400">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-5 text-green-700">
                <Scale className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">HEALTH METRICS</div>
              <h4 className="font-sora text-lg font-bold text-navy-900 mb-2">BMI &amp; Weight</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Monitor BMI, weight and important health metrics.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-line rounded-[20px] p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-green-400">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-5 text-green-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">PROGRESS TRACKING</div>
              <h4 className="font-sora text-lg font-bold text-navy-900 mb-2">Analytics</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Visualize your fitness journey with charts and statistics.</p>
            </div>

            {/* Feature 6 (Highlighted AI Card) */}
            <div className="bg-navy-900 border border-navy-900 rounded-[20px] p-7 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <span className="ai-pulse absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="w-11 h-11 rounded-xl bg-green-400/20 flex items-center justify-center mb-5 text-green-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">AI HEALTH ASSISTANT</div>
              <h4 className="font-sora text-lg font-bold text-white mb-2">Personal Guidance</h4>
              <p className="text-[#A7B4AC] text-sm leading-relaxed">Get personalized recommendations powered by AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="py-24 bg-green-050 border-y border-line">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-3">
              <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
              How It Works
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              From sign-up to insight, in four steps
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Setting up FitTrack is quick — start tracking today and let the platform learn your patterns over time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-green-700 text-white font-mono font-bold text-sm flex items-center justify-center mb-5 shadow-sm">
                01
              </div>
              <h3 className="font-sora text-base font-bold text-navy-900 mb-2">Create Account</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Create your FitTrack account.</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-green-700 text-white font-mono font-bold text-sm flex items-center justify-center mb-5 shadow-sm">
                02
              </div>
              <h3 className="font-sora text-base font-bold text-navy-900 mb-2">Set Your Profile</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Enter your health information and fitness goals.</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-green-700 text-white font-mono font-bold text-sm flex items-center justify-center mb-5 shadow-sm">
                03
              </div>
              <h3 className="font-sora text-base font-bold text-navy-900 mb-2">Track Your Data</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Record workouts, meals, water and health information.</p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-green-700 text-white font-mono font-bold text-sm flex items-center justify-center mb-5 shadow-sm">
                04
              </div>
              <h3 className="font-sora text-base font-bold text-navy-900 mb-2">Get Personalized Insights</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Monitor progress and receive AI-powered recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROGRESS / ANALYTICS PREVIEW ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-3">
              <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
              Analytics
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Understand Your Progress
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Turn your daily health data into meaningful progress.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 4 Stat Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* BMI */}
              <div className="p-5 rounded-[14px] bg-[#FAFAF8] border border-line flex items-center gap-4 shadow-sm">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-[conic-gradient(#278B62_68%,#E3E9E4_0)] flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-navy-900">22.4</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-0.5">BMI Score</h4>
                  <div className="font-mono text-lg font-bold text-navy-900">Normal</div>
                </div>
              </div>

              {/* Water */}
              <div className="p-5 rounded-[14px] bg-[#FAFAF8] border border-line flex items-center gap-4 shadow-sm">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-[conic-gradient(#4FAE85_74%,#E3E9E4_0)] flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-navy-900">74%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-0.5">Water Intake</h4>
                  <div className="font-mono text-lg font-bold text-navy-900">1.8 / 2.4 L</div>
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="p-5 rounded-[14px] bg-[#FAFAF8] border border-line flex items-center gap-4 shadow-sm">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-[conic-gradient(#1F6F4F_88%,#E3E9E4_0)] flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-navy-900">88%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-0.5">Weekly Goal</h4>
                  <div className="font-mono text-lg font-bold text-navy-900">On Track</div>
                </div>
              </div>

              {/* Calories */}
              <div className="p-5 rounded-[14px] bg-[#FAFAF8] border border-line flex items-center gap-4 shadow-sm">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-[conic-gradient(#D98A3D_61%,#E3E9E4_0)] flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-navy-900">1.9k</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-0.5">Calories Today</h4>
                  <div className="font-mono text-lg font-bold text-navy-900">of 2,100 kcal</div>
                </div>
              </div>
            </div>

            {/* Right Column: Weight Progress + Weekly Activity Chart */}
            <div className="lg:col-span-7 bg-[#FAFAF8] border border-line rounded-[20px] p-6 sm:p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-sora text-base sm:text-lg font-bold text-navy-900">Weight Progress</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Last 30 days · demo data</p>
                  </div>
                  <div className="flex gap-4 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <i className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Actual
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <i className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Goal
                    </span>
                  </div>
                </div>

                {/* SVG Progress Chart */}
                <div className="w-full h-32 mb-6">
                  <svg viewBox="0 0 600 130" className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                      points="0,40 60,50 120,45 180,60 240,55 300,70 360,65 420,80 480,75 540,90 600,85"
                      fill="none"
                      stroke="#AAB4BC"
                      strokeWidth="2"
                      strokeDasharray="4 5"
                    />
                    <polyline
                      points="0,30 60,35 120,32 180,45 240,42 300,55 360,50 420,62 480,58 540,66 600,60"
                      fill="none"
                      stroke="#1F6F4F"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Weekly Activity Bars */}
              <div className="pt-4 border-t border-line">
                <div className="text-xs font-semibold text-slate-500 uppercase font-mono mb-3">Weekly Consistency</div>
                <div className="flex items-end gap-3 sm:gap-4 h-24">
                  {[
                    { day: 'MON', h: '45%' },
                    { day: 'TUE', h: '70%' },
                    { day: 'WED', h: '55%' },
                    { day: 'THU', h: '88%' },
                    { day: 'FRI', h: '75%' },
                    { day: 'SAT', h: '100%' },
                    { day: 'SUN', h: '62%' }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-b from-green-400 to-green-700 transition-all duration-300"
                        style={{ height: bar.h }}
                      />
                      <span className="font-mono text-[10px] text-slate-500">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI HEALTH ASSISTANT SECTION ===== */}
      <section className="py-24 bg-navy-900 text-white">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-400 font-semibold mb-3">
              <span className="w-4 h-[1.5px] bg-green-400 inline-block" />
              AI Health Assistant
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-white mb-4">
              Meet Your AI Health Assistant
            </h2>
            <p className="text-[#9AA6AC] text-base leading-relaxed">
              Get personalized recommendations based on your fitness activities, health metrics and goals.
            </p>
          </div>

          {/* Interactive Chat Shell Preview */}
          <div className="max-w-2xl mx-auto bg-navy-800 border border-line-dark rounded-[20px] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-line-dark">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-400 to-green-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">FitTrack Assistant</div>
                  <div className="text-xs text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#8792A0]">PREVIEW MODE</span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 min-h-[190px]">
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-green-700 text-white text-sm px-4 py-3 rounded-2xl rounded-tr-sm leading-relaxed shadow-sm">
                  {activeQuestion}
                </div>
              </div>

              {/* AI Bubble */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-navy-700 text-[#E7EBEA] text-sm px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed border border-line-dark/60">
                  {interactiveMsg}
                </div>
              </div>
            </div>

            {/* Interactive Prompt Pills */}
            <div className="px-6 py-2.5 bg-navy-900/60 border-t border-line-dark flex flex-wrap gap-2">
              {Object.keys(sampleChats).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeQuestion === prompt
                      ? 'bg-green-700 text-white border-green-600'
                      : 'bg-navy-700/80 text-[#AAB4BC] border-line-dark hover:text-white hover:border-green-400'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar Preview */}
            <div className="p-4 border-t border-line-dark flex items-center gap-3">
              <div className="flex-1 bg-navy-700 border border-line-dark rounded-full px-4 py-2.5 text-xs text-[#8792A0] font-inter">
                Ask your AI Assistant...
              </div>
              <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white shadow-sm flex-shrink-0 cursor-pointer hover:bg-green-600 transition-colors">
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT FITTRACK SECTION ===== */}
      <section id="about" className="py-24">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Floating Cards Mock */}
            <div className="relative h-[380px] hidden sm:block">
              <div className="absolute top-0 left-4 bg-white border border-line rounded-[20px] shadow-md p-5 w-60 z-30 transform hover:scale-105 transition-transform">
                <h5 className="font-sora font-semibold text-sm text-navy-900 flex items-center gap-2 mb-1">
                  🏃 Fitness Tracking
                </h5>
                <p className="text-xs text-slate-500">Every workout, logged and visualized.</p>
              </div>

              <div className="absolute top-20 right-4 bg-white border border-line rounded-[20px] shadow-md p-5 w-60 z-20 transform hover:scale-105 transition-transform">
                <h5 className="font-sora font-semibold text-sm text-navy-900 flex items-center gap-2 mb-1">
                  🥗 Nutrition Tracking
                </h5>
                <p className="text-xs text-slate-500">Meals and macros made simple.</p>
              </div>

              <div className="absolute bottom-16 left-0 bg-white border border-line rounded-[20px] shadow-md p-5 w-60 z-10 transform hover:scale-105 transition-transform">
                <h5 className="font-sora font-semibold text-sm text-navy-900 flex items-center gap-2 mb-1">
                  ❤️ Health Monitoring
                </h5>
                <p className="text-xs text-slate-500">BMI, weight and vitals in view.</p>
              </div>

              <div className="absolute bottom-0 right-8 bg-white border border-line rounded-[20px] shadow-md p-5 w-60 z-40 transform hover:scale-105 transition-transform">
                <h5 className="font-sora font-semibold text-sm text-navy-900 flex items-center gap-2 mb-1">
                  🤖 AI Assistance
                </h5>
                <p className="text-xs text-slate-500">Guidance that adapts to you.</p>
              </div>
            </div>

            {/* Right: Checklist */}
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-3">
                <span className="w-4 h-[1.5px] bg-green-600 inline-block" />
                About FitTrack
              </div>

              <h2 className="font-sora text-3xl sm:text-4xl font-bold text-navy-900 mb-6 leading-tight">
                One connected platform, every part of your health
              </h2>

              <ul className="divide-y divide-line">
                {[
                  'Fitness tracking',
                  'Nutrition tracking',
                  'Health monitoring',
                  'Progress analytics',
                  'AI-powered assistance'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 py-3.5 text-[15px] font-medium text-navy-900">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CALL TO ACTION ===== */}
      <section className="py-24 bg-gradient-to-b from-green-900 to-navy-900 text-center text-white relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-[#9AA6AC] text-base mb-8">
            Start your fitness journey with FitTrack.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center font-sora font-semibold text-base px-9 py-4 rounded-full bg-green-700 hover:bg-green-600 text-white shadow-[0_12px_28px_rgba(31,111,79,0.35)] hover:shadow-[0_16px_36px_rgba(31,111,79,0.45)] transition-all transform hover:-translate-y-0.5"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* ===== APPLICATION FLOW STRIP ===== */}
      <section className="py-16 bg-[#FAFAF8] border-b border-line">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-700 font-semibold mb-2">
              Application Flow
            </div>
            <h2 className="font-sora text-2xl font-bold text-navy-900">
              From the home page into your dashboard
            </h2>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white border-[1.5px] border-line flex items-center justify-center shadow-sm text-green-700">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-navy-900 uppercase">Home</span>
              <span className="text-[11.5px] text-slate-500">Public landing page</span>
            </div>

            <div className="w-8 h-[1.5px] bg-slate-300 hidden sm:block" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white border-[1.5px] border-line flex items-center justify-center shadow-sm text-green-700">
                <Lock className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-navy-900 uppercase">Login / Sign Up</span>
              <span className="text-[11.5px] text-slate-500">Authenticate</span>
            </div>

            <div className="w-8 h-[1.5px] bg-slate-300 hidden sm:block" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white border-[1.5px] border-line flex items-center justify-center shadow-sm text-green-700">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-navy-900 uppercase">Dashboard</span>
              <span className="text-[11.5px] text-slate-500">Authenticated SPA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROFESSIONAL FOOTER ===== */}
      <footer className="bg-navy-900 text-[#8792A0] pt-16 pb-10">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start pb-12 border-b border-line-dark gap-8">
            <div>
              <div className="flex items-center gap-2.5 font-sora font-bold text-lg text-white mb-3">
                <div className="w-7 h-7 rounded-[8px] bg-green-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                FITTRACK
              </div>
              <p className="text-xs text-[#9AA6AC] max-w-xs leading-relaxed">
                Your health, your progress, your FitTrack — an AI-powered fitness and wellness platform.
              </p>
            </div>

            <div className="flex gap-16 sm:gap-24">
              <div>
                <h5 className="font-mono text-[11px] uppercase tracking-wider text-[#5C6773] font-semibold mb-4">
                  Product
                </h5>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-mono text-[11px] uppercase tracking-wider text-[#5C6773] font-semibold mb-4">
                  Company
                </h5>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#home" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#home" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-[#5C6773] gap-4">
            <span>© 2026 FitTrack. All rights reserved.</span>
            <span>Designed as a premium SPA fitness experience</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
