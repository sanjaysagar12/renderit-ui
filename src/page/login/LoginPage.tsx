import { type FormEvent, useState } from "react";
import { useRoute } from "@/route";
// shadcn UI imports (adjust paths if your setup differs)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
	const { login } = useRoute();
	const [user, setUser] = useState("");
	const [pass, setPass] = useState("");
	const [remember, setRemember] = useState(false);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		// create a simple token (replace with real auth)
		const token = btoa(`local:${user}:${pass}:${Date.now()}`);
		if (remember) localStorage.setItem("remember_me", "1");
		else localStorage.removeItem("remember_me");
		login(token);
	};

	const onGoogleSignIn = () => {
		// In a real app you'd use Google's OAuth flow. Here we simulate a token.
		const token = `google:${Date.now()}`;
		login(token);
	};

	return (
		// centered wrapper: full viewport height, flex center, small padding for mobile
		<div className="min-h-svh flex items-center justify-center p-6">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-lg font-semibold">Sign in to your account</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">Enter your credentials or continue with a social account</p>
				</CardHeader>

				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<Label htmlFor="username" className="text-sm">
								Email
							</Label>
							<Input
								id="username"
								placeholder="you@example.com"
								value={user}
								autoFocus
								onChange={(e) => setUser(e.target.value)}
								required
								className="w-full"
							/>
						</div>

						<div>
							<Label htmlFor="password" className="text-sm">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={pass}
								onChange={(e) => setPass(e.target.value)}
								required
								className="w-full"
							/>
						</div>

						<div className="flex items-center justify-between">
							<label className="flex items-center space-x-2">
								<Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
								<span className="text-sm">Remember me</span>
							</label>
							<a
								className="text-sm text-primary hover:underline"
								href="#"
								onClick={(e) => e.preventDefault()}
							>
								Forgot password?
							</a>
						</div>

						<div className="flex justify-end">
							<Button type="submit">Sign in</Button>
						</div>
					</form>

					<div className="my-4">
						<Separator />
						<div className="text-center text-sm text-muted-foreground mt-3">Or continue with</div>
					</div>

					<div className="grid gap-2">
						<Button
							variant="outline"
							onClick={onGoogleSignIn}
							className="flex items-center justify-center gap-2"
						>
							<span className="inline-block w-4 h-4">
								<svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
									<path d="M533.5 278.4c0-18.5-1.5-37.2-4.6-55.1H272v104.4h146.6c-6.3 34-25 62.9-53.4 82.1v68.1h86.3c50.6-46.6 80-115.4 80-199.5z" />
									<path d="M272 544.3c72.4 0 133.3-23.9 177.8-64.8l-86.3-68.1c-24.1 16.2-55 25.8-91.5 25.8-70 0-129.2-47.2-150.3-110.5H31.8v69.6C76.1 483 167.5 544.3 272 544.3z" />
									<path d="M121.7 324.7c-10.4-30.4-10.4-63 0-93.4V161.7H31.8c-38.5 76.9-38.5 168.3 0 245.2l89.9-82.2z" />
									<path d="M272 107.7c38.8-.6 76.1 13.3 104.4 38.4l78.3-78.3C407.9 22.4 349.9 0 272 0 167.5 0 76.1 61.3 31.8 161.7l89.9 69.6C142.8 155 202 107.7 272 107.7z" />
								</svg>
							</span>
							Sign in with Google
						</Button>
					</div>
				</CardContent>

				<CardFooter className="text-center">
					<p className="text-xs text-muted-foreground">
						By continuing you agree to our{" "}
						<a href="#" className="underline">
							Terms
						</a>{" "}
						and{" "}
						<a href="#" className="underline">
							Privacy
						</a>
						.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
