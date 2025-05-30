"use client"

import { useState } from "react";
import { signInAction } from "@/src/app/actions";
import { SubmitButton } from "@/src/components/submit-button";
import { Input } from "@/src/components/ui/input";
import { Label } from "../components/ui/label";
import Image from "next/image";
import { FaUserMd, FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default function Login() {
  const [error, setError] = useState(false);

	const handleSubmit = async (formData: FormData) => {
    try {
      await signInAction(formData);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-dark2">
			{/* Left Section - Sign In Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-0">
				<form
        action={handleSubmit}
					className="flex flex-col w-full max-w-md p-8 rounded-xl shadow-2xl animate-jump-in animate-once animate-duration-1000 animate-ease-in dark:bg-dark border border-orange-300 dark:border-dark4"
				>
					<h1 className="text-3xl lg:text-4xl font-bold text-center">
						Sign in
					</h1>
					<div className="flex flex-col gap-4 mt-6">
						<Label htmlFor="email">Username</Label>
						<Input
							name="email"
							placeholder="test@fisherfarms.ph"
							required
							className="p-3 text-lg border rounded-lg"
						/>
					  <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs text-foreground underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>        
						<Input
							type="password"
							name="password"
							placeholder="Your password"
							required
							className="p-3 text-lg border rounded-lg"
						/>
						<SubmitButton
							pendingText="Signing In..."
							formAction={signInAction}
							className="mt-4 py-3 text-lg font-semibold rounded-lg"
						>
							Sign in
						</SubmitButton>
					</div>
				</form>
			</div>

        {/* Right side: Feature Highlight Section */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500 dark:bg-none dark:bg-dark p-12 relative overflow-hidden">
        <div className="text-white relative z-10">
          <h2 className="text-5xl font-bold mb-6">
            Plant Performance Management System
          </h2>
          <p className="text-xl text-orange-100 dark:text-white mb-8 leading-relaxed">
            A centralized platform for tracking productivity, budgets, raw materials,
            labor, and operations at Fisher Farms Inc.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-orange-100 dark:text-white">
            <div className="bg-orange-900 dark:bg-dark3 bg-opacity-50 p-6 rounded-lg backdrop-filter backdrop-blur-lg transform transition duration-500 hover:scale-105 border border-orange-300 dark:border-dark4">
              <FaChartLine className="text-4xl text-orange-200 dark:text-dark4 mb-4" />
              <h3 className="text-2xl font-semibold mb-2 ">
                Real-Time Data
              </h3>
              <p>
                Monitor daily inputs for production, inventory, and financials in real-time.
              </p>
            </div>
            <div className="bg-orange-900 dark:bg-dark3 bg-opacity-50 p-6 rounded-lg backdrop-filter backdrop-blur-lg transform transition duration-500 hover:scale-105 border border-orange-300 dark:border-dark4">
              <FaUserMd className="text-4xl text-orange-200 dark:text-dark4 mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-orange-100 dark:text-white">
                Integrated Operations
              </h3>
              <p>
                Link labor, raw materials, utilities, and performance into a single view.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 transform translate-x-1/4 translate-y-1/4">
          <Image
            src="/login/piechart.png"
            alt="Plant Performance Dashboard"
            className="rounded-tl-3xl shadow-2xl animate-shake animate-infinite animate-duration-[2000ms] animate-ease-linear"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
    </div>
  );
}
