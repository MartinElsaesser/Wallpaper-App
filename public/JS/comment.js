const textarea = document.querySelector("textarea#comment");
const button = document.querySelector("button#comment-submit");

textarea.addEventListener("input", _ => {
	button.disabled = textarea.value.length < 10
})