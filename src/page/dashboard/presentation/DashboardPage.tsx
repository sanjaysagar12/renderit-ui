import { useMemo, useState } from "react";
import { useRoute } from "@/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
	const { logout } = useRoute();

	type Status = "stopped" | "running" | "deploying";
	type Site = {
		name: string;
		repo: string;
		url?: string | null;
		status: Status;
		container?: string;
		buildCmd?: string;
		busy?: boolean;
	};

	const [sites, setSites] = useState<Site[]>([
		{
			name: "example-cloudplatform-app",
			repo: "https://github.com/your-org/your-repo",
			url: "https://example-cloudplatform-app.vercel.app",
			status: "running",
			container: "node:18",
			buildCmd: "npm install && npm run build",
		},
	]);

	// replace showForm with modal state
	const [showModal, setShowModal] = useState(false);
	const [formRepo, setFormRepo] = useState("");
	const [formName, setFormName] = useState("");
	const [formContainer, setFormContainer] = useState("node:18");

	const getDefaultBuildCmd = (container: string) => {
		if (container.startsWith("node")) return "npm install && npm run build";
		if (container.startsWith("python")) return "pip install -r requirements.txt && python -m build";
		if (container.startsWith("deno")) return "deno cache && deno run --allow-net ./mod.ts";
		if (container.startsWith("docker")) return "docker build -t app .";
		return "npm run build";
	};

	const [formBuildCmd, setFormBuildCmd] = useState(() => getDefaultBuildCmd(formContainer));

	// search + filter
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<"all" | Status | "with-url">("all");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return sites.filter((s) => {
			if (filter === "with-url" && !s.url) return false;
			if (filter !== "all" && filter !== "with-url" && s.status !== filter) return false;
			if (!q) return true;
			return s.name.toLowerCase().includes(q) || s.repo.toLowerCase().includes(q) || (s.url || "").toLowerCase().includes(q);
		});
	}, [sites, query, filter]);

	const simulateSiteUpdate = (index: number, nextStatus: Status, delay = 1200, setUrl?: string | null) => {
		setSites((prev) => prev.map((s, i) => (i === index ? { ...s, status: "deploying", busy: true } : s)));
		setTimeout(() => {
			setSites((prev) =>
				prev.map((s, i) =>
					i === index ? { ...s, status: nextStatus, busy: false, url: setUrl !== undefined ? setUrl : s.url } : s
				)
			);
		}, delay);
	};

	const handleDeploy = (index: number) => {
		const generatedUrl = `https://${sites[index].name}.example.vercel.app`;
		simulateSiteUpdate(index, "running", 1400, generatedUrl);
	};
	const handleRedeploy = (index: number) => simulateSiteUpdate(index, "running", 1600);
	const handleStop = (index: number) => simulateSiteUpdate(index, "stopped", 800, sites[index].url ?? null);
	const handleDelete = (index: number) => {
		setSites((prev) => prev.filter((_, i) => i !== index));
	};

	const handleHostSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!formName || !formRepo) return;
		const newSite: Site = {
			name: formName,
			repo: formRepo,
			url: null,
			status: "deploying",
			container: formContainer,
			buildCmd: formBuildCmd,
			busy: true,
		};
		setSites((prev) => [newSite, ...prev]);
		const newIndex = 0;
		setTimeout(() => {
			setSites((prev) =>
				prev.map((s, i) =>
					i === newIndex
						? {
								...s,
								status: "running",
								busy: false,
								url: `https://${formName}.example.vercel.app`,
						  }
						: s
				)
			);
		}, 1800);
		setFormRepo("");
		setFormName("");
		setFormContainer("node:18");
		setFormBuildCmd(getDefaultBuildCmd("node:18"));
		setShowModal(false);
	};

	// stats
	const total = sites.length;
	const running = sites.filter((s) => s.status === "running").length;
	const stopped = sites.filter((s) => s.status === "stopped").length;
	const deploying = sites.filter((s) => s.status === "deploying").length;

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b sticky top-0 z-10 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
							CP
						</div>
						<h1 className="text-xl font-semibold text-gray-900">CloudPlatform</h1>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-sm text-muted-foreground">Welcome back!</div>
						<Button variant="outline" size="sm" onClick={logout}>
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="mb-6 flex items-center justify-between gap-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">Deployments</h2>
						<p className="text-sm text-muted-foreground mt-1">Manage and monitor your hosted sites</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="text-sm text-center px-3 py-2 bg-white rounded shadow-sm">
							<div className="text-xs text-muted-foreground">Total</div>
							<div className="font-medium">{total}</div>
						</div>
						<div className="text-sm text-center px-3 py-2 bg-white rounded shadow-sm">
							<div className="text-xs text-muted-foreground">Running</div>
							<div className="text-green-600 font-medium">{running}</div>
						</div>
						<div className="text-sm text-center px-3 py-2 bg-white rounded shadow-sm">
							<div className="text-xs text-muted-foreground">Stopped</div>
							<div className="text-gray-700 font-medium">{stopped}</div>
						</div>
						<Button onClick={() => setShowModal(true)} size="sm">
							+ New Site
						</Button>
					</div>
				</div>

				<Card className="mb-6 shadow">
					<CardContent className="space-y-4">
						{/* search & filters */}
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div className="flex items-center gap-3 w-full md:w-1/2">
								<Input placeholder="Search by name, repo, or url" value={query} onChange={(e) => setQuery(e.target.value)} />
							</div>
							<div className="flex items-center gap-2">
								<select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="input">
									<option value="all">All</option>
									<option value="running">Running</option>
									<option value="stopped">Stopped</option>
									<option value="deploying">Deploying</option>
									<option value="with-url">Has URL</option>
								</select>
							</div>
						</div>

						{/* sites list */}
						{filtered.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">No sites match your criteria.</div>
						) : (
							<div className="grid gap-4">
								{filtered.map((site, idx) => (
									<div key={site.name + idx} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<a href={site.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline group min-w-0">
													<svg className="w-5 h-5 text-gray-700 group-hover:text-primary" viewBox="0 0 24 24" fill="currentColor">
														<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.27 3.38.97.11-.76.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.03 11.03 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.45-2.7 5.42-5.28 5.71.42.36.8 1.08.8 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56A10.51 10.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
													</svg>
													<span className="font-semibold text-gray-900 truncate">{site.name}</span>
												</a>

												<div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded ml-2">
													{site.container || "node:18"}
												</div>
											</div>

											<div className="flex items-center gap-2 ml-4">
												<span className={`px-3 py-1 rounded-full text-xs font-medium ${site.status === "running" ? "bg-green-100 text-green-700" : site.status === "deploying" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
													{site.busy ? "deploying" : site.status}
												</span>
											</div>
										</div>

										<div className="mb-3">
											{site.url ? (
												<a href={site.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
													</svg>
													{site.url}
												</a>
											) : (
												<span className="text-sm text-muted-foreground">Not hosted yet</span>
											)}
										</div>

										<div className="flex items-center gap-2">
											{site.status === "stopped" && (
												<>
													<Button size="sm" onClick={() => handleDeploy(idx)} disabled={site.busy}>
														Deploy
													</Button>
													<Button size="sm" variant="ghost" onClick={() => handleDelete(idx)} disabled={site.busy} aria-label="Delete site">
														<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
															<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
														</svg>
													</Button>
												</>
											)}

											{site.status === "running" && (
												<>
													<Button size="sm" variant="outline" onClick={() => handleRedeploy(idx)} disabled={site.busy}>
														Redeploy
													</Button>
													<Button size="sm" variant="destructive" onClick={() => handleStop(idx)} disabled={site.busy}>
														Stop
													</Button>
												</>
											)}

											{site.status === "deploying" && (
												<Button size="sm" disabled>
													<svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
														<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"></circle>
														<path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
													</svg>
													Deploying...
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Modal popup for hosting a new site */}
				{showModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
						{/* backdrop */}
						<div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
						<Card className="w-full max-w-2xl z-10 shadow-lg">
							<CardHeader>
								<div className="flex items-center justify-between w-full">
									<CardTitle className="text-lg">Host a new site</CardTitle>
									<Button size="sm" variant="ghost" onClick={() => setShowModal(false)}>
										Close
									</Button>
								</div>
							</CardHeader>
							<CardContent className="border-t">
								<form
									onSubmit={(e) => {
										handleHostSubmit(e);
										setShowModal(false);
									}}
									className="space-y-4"
								>
									<div className="grid md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="repo">GitHub Repository URL</Label>
											<Input
												id="repo"
												placeholder="https://github.com/owner/repo"
												value={formRepo}
												onChange={(e) => setFormRepo(e.target.value)}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="sitename">Site Name</Label>
											<Input
												id="sitename"
												placeholder="my-awesome-site"
												value={formName}
												onChange={(e) => setFormName(e.target.value)}
												required
											/>
										</div>
									</div>

									<div className="grid md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="container">Container</Label>
											<Select
												value={formContainer}
												onValueChange={(v) => {
													setFormContainer(v);
													setFormBuildCmd(getDefaultBuildCmd(v));
												}}
											>
												<SelectTrigger id="container">
													<SelectValue placeholder="Select container" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="node:18">node:18</SelectItem>
													<SelectItem value="node:16">node:16</SelectItem>
													<SelectItem value="python:3.10">python:3.10</SelectItem>
													<SelectItem value="python:3.9">python:3.9</SelectItem>
													<SelectItem value="deno:1.30">deno:1.30</SelectItem>
													<SelectItem value="docker:latest">docker:latest</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="buildcmd">Build Command</Label>
											<Input
												id="buildcmd"
												placeholder="npm run build"
												value={formBuildCmd}
												onChange={(e) => setFormBuildCmd(e.target.value)}
											/>
										</div>
									</div>

									<div className="flex justify-end gap-2 pt-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												// reset and close modal
												setFormRepo("");
												setFormName("");
												setFormContainer("node:18");
												setFormBuildCmd(getDefaultBuildCmd("node:18"));
												setShowModal(false);
											}}
										>
											Cancel
										</Button>
										<Button type="submit">Deploy Site</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				)}
			</main>
		</div>
	);
}
