import { outro } from "@clack/prompts";
import pc from "picocolors";

export function formatNumber(num: number): string {
	if (num < 1000) return num.toString();
	if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

/**
 * Fun success messages for exit
 */
const SUCCESS_MESSAGES = [
	{ emoji: "🚀", text: "Skills locked and loaded!" },
	{ emoji: "✨", text: "Your agent just leveled up!" },
	{ emoji: "🎯", text: "New abilities unlocked!" },
	{ emoji: "⚡", text: "Supercharged and ready to go!" },
	{ emoji: "🌟", text: "Skills successfully acquired!" },
	{ emoji: "🔮", text: "Magic powers installed!" },
	{ emoji: "🎪", text: "New tricks in the bag!" },
	{ emoji: "🏆", text: "Achievement unlocked: Skill Master!" },
	{ emoji: "😊", text: "Happy coding!" },
];

const getRandomSuccessMessage = () => {
	const idx = Math.floor(Math.random() * SUCCESS_MESSAGES.length);
	return SUCCESS_MESSAGES[idx]!;
};

/**
 * Show a friendly exit message with ASCII art
 */
export const showExitMessage = (): void => {
	const moonArt = pc.yellow(
		`    *  .  *
       .    *    .
   *   .        .       *
     .    *  .     . *
   .  *        *  .    .`,
	);

	const { emoji, text } = getRandomSuccessMessage();

	const message =
		`${moonArt}\n\n` +
		`${emoji} ${pc.bold(text)}\n\n` +
		`To find plugins and browse skills on the web, see:\n` +
		`${pc.blue(pc.underline("https://claude-plugins.dev"))}\n\n` +
		`To share ideas and issues, come visit us on the Moon:\n` +
		`${pc.magenta(pc.underline("https://discord.gg/Pt9uN4FXR4"))}\n\n` +
		`${pc.dim("This project is open-source and we'd love to hear from you!")}`;

	outro(message);
};
