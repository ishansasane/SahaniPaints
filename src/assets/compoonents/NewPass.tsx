import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NewPass: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [pass, setPass] = useState<string>('');
    const [confirmpass, setConfirmPass] = useState<string>('');
    const [confirmpasserror, setConfirmPassError] = useState<string>('');

    useEffect(() => {
        if (pass === confirmpass) {
            setConfirmPassError('');
        } else {
            setConfirmPassError("Passwords don't match");
        }
    }, [pass, confirmpass]);

    const newPassword = async () => {
        if (!token) {
            alert('Invalid token');
            return;
        }
        
        const response = await fetch(`https://sheeladecor.netlify.app/.netlify/functions/server/auth/passwordreset/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials : "include",
            body: JSON.stringify({ password: pass, token }),
        });

        if (response.status === 200) {
            alert('Password reset successful');
            navigate('/login');
        } else {
            alert('Error in password reset');
        }
    };

    return (
        <div className='h-screen flex items-center justify-center font-serif'>
            <div className='flex flex-col items-center w-[70vw] md:w-[40vw] lg:w-[30vw] rounded-2xl gap-2 border-1 border-gray-400 p-2 md:p-4'>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='text-sky-600 font-semibold text-[6vw] md:text-[3.5vw] lg:text-[2.5vw]'>New Password</p>
                    <p className='text-sm md:text-[1.5vw] lg:text-[1vw] px-2 text-center'>Enter a new and strong password</p>
                </div>
                <input value={pass} onChange={(e) => setPass(e.target.value)} className='text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] lg:h-10 h-8 w-full rounded-xl border-1 border-gray-400 pl-2 mt-4' type='password' placeholder='Password' />
                <input value={confirmpass} onChange={(e) => setConfirmPass(e.target.value)} className='text-[3.3vw] md:text-[2vw] lg:text-[1.2vw] lg:h-10 h-8 w-full rounded-xl border-1 border-gray-400 pl-2' type='password' placeholder='Confirm Password' />
                <p className='text-red-700 md:text-[12px] text-[8px] -my-2 pl-1'>{confirmpasserror}</p>
                <button onClick={newPassword} className='lg:h-10 h-8 bg-sky-400 w-full rounded-xl hover:bg-sky-500 md:text-lg'>Submit</button>
            </div>
        </div>
    );
};

export default NewPass;
