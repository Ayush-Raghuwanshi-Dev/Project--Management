import { z } from 'zod'
import { SignUpSchema } from '@/lib/Schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SignUpFormData = z.infer<typeof SignUpSchema>

export default function SignUp() {
    const form = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const handleOnSubmit = (values: SignUpFormData) => {
        console.log(values)
    }

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4'>
            <Card className='max-w-[400px] w-full bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl'>
                <CardHeader className='text-center space-y-2 pb-6 pt-8'>
                    <CardTitle className='text-xl md:text-2xl font-bold text-[#1a1a2e]'>Create an account</CardTitle>
                    <CardDescription className='text-sm text-[#4a4a5a]'>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-4'>
                        <div className='space-y-2'>
                            <label htmlFor='fullName' className='text-xs font-semibold text-[#1a1a2e]'>Full Name</label>
                            <Input 
                                id='fullName' 
                                type='text' 
                                placeholder='John Doe' 
                                className='bg-white shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('fullName')} 
                            />
                            {form.formState.errors.fullName && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.fullName.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='email' className='text-xs font-semibold text-[#1a1a2e]'>Email</label>
                            <Input 
                                id='email' 
                                type='email' 
                                placeholder='email@example.com' 
                                className='bg-white shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('email')} 
                            />
                            {form.formState.errors.email && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='password' className='text-xs font-semibold text-[#1a1a2e]'>Password</label>
                            <Input 
                                id='password' 
                                type='password' 
                                placeholder='••••••••' 
                                className='bg-white shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('password')} 
                            />
                            {form.formState.errors.password && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='confirmPassword' className='text-xs font-semibold text-[#1a1a2e]'>Confirm Password</label>
                            <Input 
                                id='confirmPassword' 
                                type='password' 
                                placeholder='••••••••' 
                                className='bg-white shadow-sm rounded-lg h-11 text-sm'
                                {...form.register('confirmPassword')} 
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className='text-xs text-red-500 mt-1'>{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                        
                        <div className='pt-4'>
                            <Button type='submit' className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium'>
                                Create account
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className='flex justify-center pb-8'>
                    <div className='text-sm text-[#4a4a5a]'>
                        Already have an account?{' '}
                        <Link to='/sign-in' className='font-semibold text-blue-600 hover:underline'>
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}