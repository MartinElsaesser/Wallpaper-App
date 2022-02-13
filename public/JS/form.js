const form = document.querySelector("form#form");
const select = document.querySelector("select#device");

console.log(form);
console.log(select);

form.addEventListener("submit", (e) => {
	console.log(`"${select.value}"`);
	if (!select.value) {
		select.setCustomValidity("Select option")
		e.preventDefault();
	}
}, false)