import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [loader, setLoader] = useState(false)
  const [err, setErr] = useState(null)

  const handlechange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoader(true)
    setErr(null)
    try {
      const res = await api.post('/customers/login', form)
      setUser(res.data.user)
      console.log(res)
      setLoader(false)
      console.log('User logged in')
      navigate('/home')
    } catch (error) {
      setLoader(false)
      setErr(error.response?.data?.message || error.message)
      console.log(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Header / Logo Area */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-sm mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Log in to your account</h2>
        <p className="mt-2 text-sm text-slate-400">Welcome back! Enter your details below.</p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 shadow-sm ring-1 ring-slate-800 sm:rounded-2xl sm:px-10">
          {err && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 text-red-400 text-sm border border-red-900">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email}
                onChange={handlechange}
                placeholder="alex@example.com"
                required
                className="w-full rounded-xl border-0 py-2.5 px-3.5 bg-slate-950 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm transition-all duration-150 outline-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                value={form.password}
                onChange={handlechange}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border-0 py-2.5 px-3.5 bg-slate-950 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm transition-all duration-150 outline-none"
              />
            </div>

            {/* Log in Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loader}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loader ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>

          {/* Terms Notice */}
          <p className="mt-4 text-center text-xs text-slate-500">
            By signing in, you agree to our{' '}
            <a href="#terms" className="underline hover:text-slate-300">Terms</a> and{' '}
            <a href="#privacy" className="underline hover:text-slate-300">Privacy Policy</a>.
          </p>
        </div>

        {/* Link to Register */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
