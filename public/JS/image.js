const fileInput = document.querySelector("#file");
const image = document.querySelector("#img");

fileInput.addEventListener("change", async (e) => {
	const file = e.target.files[0];

	if (!file) return image.src = img.dataset.src;
	const dataUrl = await readAsDataURL(file);
	image.src = dataUrl;
})

function readAsDataURL(file) {
	return new Promise((resolve, reject) => {
		const fr = new FileReader();
		fr.onerror = reject;
		fr.onload = () => {
			resolve(fr.result);
		}
		fr.readAsDataURL(file);
	});
}