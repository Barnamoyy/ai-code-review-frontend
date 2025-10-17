'use client'
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth"
import Authentication from "@/pages/Authentication";
import { useRouter } from "next/navigation";

export default function Component() {
  const {isAuthenticated} = useAuth(); 
  const router = useRouter(); 
  useEffect(() => {
    if(isAuthenticated){
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])
  return (
    <Authentication />
  )
}
