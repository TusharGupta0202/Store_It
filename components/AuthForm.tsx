'use client';

import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form,  FormItem,  FormLabel,  FormControl,  FormMessage, FormField } from "@/components/ui/form"
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createAccount } from "@/lib/actions/user.actions";
import OTPModal from "./OTPModal";


type FormType = "sign-in" | "sign-up"

const authFormSchema = (formType : FormType) => {
  return z.object({
    fullName: formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
    email: z.email(),
  })
} 

const AuthForm = ({type}: {type: FormType}) => {

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null)

  
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {      
      fullName: "",
      email: "",
    },
  })

   const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
    const user = await createAccount({fullName: values.fullName || "", email: values.email});
    setAccountId(user.accountId);
    } catch (error) {
      setErrorMessage(`Failed to create an account. Please try again. ${error instanceof Error ? error.message : ""}`);
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title h1">
            {type === "sign-in" ? "Login" : "Sign Up"}
          </h1>
          {type === "sign-up" &&  (
            <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Full Name</FormLabel>
                   <FormControl>
                    <Input placeholder="Enter your full name" className="shad-input" {...field} />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                   <FormControl>
                    <Input placeholder="Enter your email" className="shad-input" {...field} />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          <Button type="submit" className="form-submit-button" disabled={isLoading}>
            {type === "sign-in" ? "Login" : "Sign Up"}
            {isLoading && (
              <Image src="/assets/icons/loader.svg" alt="Loader" width={24} height={24} className="ml-2 animate-spin" />
            )}
          </Button>
          {errorMessage && <p className="error-message">* {errorMessage}</p>}

          <div>
            <p className="text-light-100">
              {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
                {type === "sign-in" ? "Sign Up" : "Login"}
              </Link>
            </p>
          </div>
        </form>
      </Form>

      {accountId && <OTPModal accountId={accountId} email={form.getValues().email} />}
    </>
  )
}

export default AuthForm