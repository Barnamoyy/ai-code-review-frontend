import React from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginIcon } from "@/assets";
import Image from "next/image";

import { signIn } from "next-auth/react";

const Authentication = () => {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row justify-center items-center">
      <div className="w-full h-full md:w-1/2 relative">
        <Image
          src={loginIcon}
          alt="Login Icon"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-orange-500 opacity-30"></div>
      </div>
      <div className="w-full h-full md:w-1/2 bg-black flex justify-center items-center">
        <div className="max-w-1/2 h-full flex flex-col justify-center items-center space-y-8">
          <div className="flex flex-col justify-center items-center space-y-2">
            <h1 className="text-white font-semibold text-2xl">
              Create an account
            </h1>
            <h4 className="text-slate-300 font-normal text-base">
              Enter your email below to create your account
            </h4>
          </div>
          <div className="w-full">
            <Button
              size="lg"
              className="hover:border hover:border-white w-full"
              onClick={
                () => signIn("github")
              }
            >
              <Github />
              Sign in with Github
            </Button>
          </div>
          <div className="flex flex-col justify-center items-center space-y-2">
            <p className="text-white font-normal text-sm w-xs text-center leading-6">
              By signing in you agree to our{" "}
              <span className="text-blue-600">Terms of Service</span> and{" "}
              <span className="text-blue-600">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
