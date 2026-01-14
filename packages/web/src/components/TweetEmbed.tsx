import { useEffect, useRef, useState } from "react";

declare global {
	interface Window {
		twttr?: {
			widgets: {
				createTweet: (
					id: string,
					element: HTMLElement,
					options?: { theme?: string }
				) => Promise<HTMLElement>;
			};
		};
	}
}

interface TweetEmbedProps {
	id: string;
}

function TweetSkeleton() {
	return (
		<div className="w-full rounded-xl border border-border/50 bg-card/50 p-4 animate-pulse">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-10 h-10 rounded-full bg-muted/50" />
				<div className="flex flex-col gap-1.5">
					<div className="w-24 h-4 rounded bg-muted/50" />
					<div className="w-16 h-3 rounded bg-muted/50" />
				</div>
			</div>
			<div className="flex flex-col gap-2 mb-3">
				<div className="w-full h-4 rounded bg-muted/50" />
				<div className="w-3/4 h-4 rounded bg-muted/50" />
			</div>
			<div className="w-full h-48 rounded-lg bg-muted/50" />
		</div>
	);
}

const TWITTER_SCRIPT_URL = "https://platform.twitter.com/widgets.js";

export function TweetEmbed({ id }: TweetEmbedProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!containerRef.current) return;

		let isMounted = true;

		const renderTweet = async () => {
			if (!isMounted || !window.twttr || !containerRef.current) return;

			containerRef.current.innerHTML = "";
			await window.twttr.widgets.createTweet(id, containerRef.current, {
				theme: "dark",
			});

			if (isMounted) {
				setIsLoading(false);
			}
		};

		// If Twitter API is ready, render immediately
		if (window.twttr) {
			renderTweet();
		} else {
			// Load script if not already in DOM, then render
			let script = document.querySelector<HTMLScriptElement>(
				`script[src="${TWITTER_SCRIPT_URL}"]`
			);

			if (!script) {
				script = document.createElement("script");
				script.src = TWITTER_SCRIPT_URL;
				script.async = true;
				document.body.appendChild(script);
			}

			script.addEventListener("load", renderTweet);
		}

		return () => {
			isMounted = false;
		};
	}, [id]);

	return (
		<div className="flex justify-center w-full max-w-[550px] mx-auto">
			{isLoading && <TweetSkeleton />}
			<div
				ref={containerRef}
				className={isLoading ? "hidden" : "w-full [&>div]:!mx-auto"}
			/>
		</div>
	);
}
