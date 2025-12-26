import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

type Props = {
	selectedTab: "plugins" | "skills";
};

export function PluginOrSkillsTabSwitcher({ selectedTab }: Props) {
	const setSelectedTab = (value: string) => {
		const tab = value as "plugins" | "skills";
		let url = `/${tab}`;
		if (tab === "plugins") {
			url = "/";
		}

		document.startViewTransition(() => {
			window.location.href = url;
		});
	};

	return (
		<Tabs
			defaultValue={selectedTab}
			onValueChange={setSelectedTab}
			className="w-full max-w-[400px]"
		>
			<TabsList>
				<TabsTrigger value="plugins">Browse Claude Plugins</TabsTrigger>
				<TabsTrigger value="skills">Browse Agent Skills</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
