// pages/Auth.jsx - Premium Cinematic Design
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { GridPattern } from '../components/ui/grid-pattern';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Command, Video, FileText, ListVideo, Link2, Search, Zap, Brain, HardDrive, Monitor } from 'lucide-react';

export default function Auth() {
    const [mode, setMode] = useState('signin');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle } = useAuthStore();
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { name, email, password } = formData;
            let result;

            if (mode === 'signup') {
                if (!name || !email || !password) throw new Error('Please fill in all fields');
                if (password.length < 6) throw new Error('Password must be at least 6 characters');
                result = await signUp(name, email, password);
            } else {
                if (!email || !password) throw new Error('Please fill in all fields');
                result = await signIn(email, password);
            }

            if (result.success) {
                toast.success(mode === 'signup' ? 'Account created' : 'Welcome back');
                navigate('/');
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const result = await signInWithGoogle();
        if (result.success) {
            navigate('/');
        } else {
            toast.error('Google sign in failed');
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-100">

            {/* Background - Minimal Grid & Aurora blobs */}
            <div className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden">
                <GridPattern
                    width={40}
                    height={40}
                    x={-1}
                    y={-1}
                    className="stroke-zinc-800/30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
                />

                {/* Aurora-like Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-500/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-4 p-4 lg:p-8 relative z-10 h-screen lg:h-auto items-center">

                {/* Left Side - Cinematic Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-col justify-between h-full min-h-[600px] p-12 border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm rounded-3xl overflow-hidden relative"
                >
                    {/* Abstract Gradient Blob */}
                    <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="bg-zinc-100 text-zinc-950 p-1.5 rounded-lg">
                                <Command size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">Kapsul</span>
                        </div>

                        <h1 className="font-serif text-6xl lg:text-8xl leading-[1.1] text-zinc-100  mb-12">
                            The operating system <br />
                            <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text pb-10 text-transparent italic block mt-6 text-4xl lg:text-5xl tracking-normal">
                                for your second brain.
                            </span>
                        </h1>

                        {/* Horizontal Infinite Marquee */}
                        <div className="relative mt-20 overflow-hidden w-full select-none [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
                            <motion.div
                                className="flex gap-6 whitespace-nowrap"
                                animate={{ x: [0, -2000] }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 45,
                                }}
                            >
                                {(() => {
                                    const features = [
                                        { icon: Video, label: "Save Video" },
                                        { icon: Link2, label: "Save Link" },
                                        { icon: FileText, label: "Write Note" },
                                        { icon: ListVideo, label: "Save Playlist" },
                                        { icon: Search, label: "Global Search" },
                                        { icon: Command, label: "CTRL + K Access" },
                                        { icon: Zap, label: "Smart Capture" },
                                        { icon: Brain, label: "Second Brain" },
                                        { icon: HardDrive, label: "Library Vault" },
                                        { icon: Monitor, label: "Deep Space Theme" }
                                    ];
                                    // Shuffle features for randomized arrangement
                                    const shuffled = [...features].sort(() => Math.random() - 0.5);

                                    return [...Array(4)].map((_, i) => (
                                        <React.Fragment key={i}>
                                            {shuffled.map((item, idx) => (
                                                <span
                                                    key={`${i}-${idx}`}
                                                    className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md text-zinc-400 font-medium text-base hover:text-white hover:border-zinc-700 transition-all cursor-default group"
                                                >
                                                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" /> {item.label}
                                                </span>
                                            ))}
                                        </React.Fragment>
                                    ));
                                })()}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Minimal Login */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center w-full max-w-md mx-auto"
                >
                    <Card className="w-full border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 sm:p-12">
                            <div className="mb-10 text-center sm:text-left">
                                <h2 className="font-serif text-3xl text-white mb-3 tracking-tight">
                                    {mode === 'signup' ? 'Create account' : 'Welcome back'}
                                </h2>
                                <p className="text-sm text-zinc-500 font-medium">
                                    {mode === 'signup' ? 'Enter your details to get started.' : 'Enter your email to sign in.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'signup' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white h-11"
                                            placeholder="Virat Kohli"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white h-11"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white h-11"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-bold uppercase tracking-widest text-[10px] mt-4 rounded-xl transition-all shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signup' ? 'Get Started' : 'Enter Kapsul'}
                                </Button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">

                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                className="w-full h-12 bg-zinc-950/50 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-3 font-medium"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="mt-10 text-center text-xs uppercase tracking-widest font-bold">
                                <span className="text-zinc-500">
                                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                </span>
                                {' '}
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                                    className="text-zinc-100 hover:text-white transition-colors ml-1"
                                >
                                    {mode === 'signup' ? 'Sign in' : 'Sign up'}
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                                >
                                    <span className="flex items-center gap-1">Continue as Guest <ArrowRight className="w-3 h-3" /></span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
