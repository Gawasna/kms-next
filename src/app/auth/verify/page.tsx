'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            setStatus('error')
            return
        }

        // Here you would typically make an API call to verify the token
        const verifyEmail = async () => {
            try {
                // Replace with actual API call
                // await api.post('/auth/verify', { token })
                setStatus('success')
            } catch (error) {
                setStatus('error')
            }
        }

        verifyEmail()
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                {status === 'loading' && (
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
                        <p>Please wait while we verify your email address.</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="text-center text-green-600">
                        <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
                        <p>Your email has been successfully verified. You can now log in.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center text-red-600">
                        <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                        <p>The verification link is invalid or has expired.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
