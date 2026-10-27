//preload all assets that the game will need not specified in the html
const urls = [
	"idle.png",
	"lose0.png",
	"lose1.png",
	"main0.png",
	"main1.png",
	"main2.png",
	"main3.png",
	"main4.png",
	"main5.png",
	"main6.png",
	"medal0.png",
	"medal1.png",
	"medal2.png",
].map((url) => "/endacopia-soccer/img/" + url)

for (const url of urls) {
	const link = document.createElement("link")
	link.rel = "preload"
	link.href = url
	link.as = "image"
	document.head.append(link)
}