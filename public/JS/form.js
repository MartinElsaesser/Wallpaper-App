const form = document.querySelector("#form");
const select = document.querySelector("select");

console.log(form);

form.addEventListener("submit", (e) => {
	if (!select.value) {
		select.setCustomValidity("Select option")
		e.preventDefault();
	}
}, false)