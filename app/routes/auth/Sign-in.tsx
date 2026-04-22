import { z } from 'zod'
import { SignInSchema } from '@/lib/Schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SigninFormData = z.infer<typeof SignInSchema>

export default function SignIn() {
    const form = useForm<SigninFormData>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const handleOnSubmit = (values: SigninFormData) => {
        console.log(values)
    }

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4'>
            <Card className='max-w-[400px] w-full bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl'>
                <CardHeader className='text-center space-y-2 pb-6 pt-8'>
                    <CardTitle className='text-xl md:text-2xl font-bold text-[#1a1a2e]'>Welcome back</CardTitle>
                    <CardDescription className='text-sm text-[#4a4a5a]'>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-4'>
                        <div className='space-y-2'>
                            <label htmlFor='email' className='text-xs font-semibold text-[#1a1a2e]'>Email Address</label>
                            <Input 
                                id='email' 
                                type='email' 
                                placeholder='email@example.com' 
                                className='bg-white border-0 shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('email')} 
                            />
                            {form.formState.errors.email && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <label htmlFor='password' className='text-xs font-semibold text-[#1a1a2e]'>Password</label>
                                <Link to='/forgot-password' className='text-xs font-semibold text-blue-600 hover:underline'>
                                    Forgot password?
                                </Link>
                            </div>
                            <Input 
                                id='password' 
                                type='password' 
                                placeholder='••••••••' 
                                className='bg-white border-0 shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('password')} 
                            />
                            {form.formState.errors.password && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        
                        <div className='pt-4'>
                            <Button type='submit' className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium'>
                                Sign in
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className='flex justify-center pb-8'>
                    <div className='text-sm text-[#4a4a5a]'>
                        Don't have an account?{' '}
                        <Link to='/sign-up' className='font-semibold text-blue-600 hover:underline'>
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}