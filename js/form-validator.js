window.addEventListener('DOMContentLoaded', () => {
    const name_exp = new RegExp('[a-zA-Z\- ]');
    const email_exp = new RegExp('[a-zA-Z0-9\-_.@]');
    const comment_exp = new RegExp('[a-zA-Z\- .!?\n,]');

    let name_error = document.querySelector('[name="name-error"]');
    let name_info = document.querySelector('[name="name-info"]');
    let email_error = document.querySelector('[name="email-error"]');
    let email_info = document.querySelector('[name="email-info"]');
    let comments_error = document.querySelector('[name="comments-error"]');
    let comments_info = document.querySelector('[name="comments-info"]');

    let form_errors = document.querySelector('[name="form-errors"]');

    let form_errors_array = [];

    let fun = false;

    let inputs = document.querySelectorAll('input');
    let text_area = document.querySelector('textarea');
    text_area.addEventListener('input', check_input);
    for(let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', check_input);
    }
    

    document.addEventListener('keydown', (event) => {
        if(event.key === 'F9') {
            fun = !fun;
            console.log(fun ? "Fun mode enabled" : "Fun mode disabled");
        }
    });

    document.querySelector('form').addEventListener('submit', form_submit);

    function form_submit(event) {
        // event.preventDefault();
        console.log(event);
    }

    function check_input(event) {
        // if(event.target.checkValidity()) {
        //     event.target.setCustomValidity('You inputted something wrong :/');
        // } else {
        //     event.target.setCustomValidity('');
        // }
        let id_split = event.target.id.split('-')[2];
        if(event.target.value.length > 0) {
            if(id_split === 'name') {
                if(name_exp.test(event.target.value.charAt(event.target.value.length - 1)) === false) {
                    if(fun) {
                        document.body.innerHTML = 'you have paid for your sins <a href="/form-js.html">return</a>';
                    }
                    name_error.innerHTML = `${event.target.value.charAt(event.target.value.length -1)} isn't allowed in this field`;
                    add_error(event.target.value.charAt(event.target.value.length - 1));
                    event.target.value = event.target.value.slice(0, -1);
                    mis_input(event);
                    fade_out(name_error);
                }
            } else if (id_split === 'email') {
                if(email_exp.test(event.target.value.charAt(event.target.value.length - 1)) === false) {
                    email_error.innerHTML = `${event.target.value.charAt(event.target.value.length -1)} isn't allowed in this field`;
                    add_error(event.target.value.charAt(event.target.value.length - 1));
                    event.target.value = event.target.value.slice(0, -1);
                    mis_input(event);
                    fade_out(email_error);
                }
            } else if (id_split === 'comments') {
                if(comment_exp.test(event.target.value.charAt(event.target.value.length - 1)) === false) {
                    comments_error.innerHTML = `${event.target.value.charAt(event.target.value.length -1)} isn't allowed in this field`;
                    add_error(event.target.value.charAt(event.target.value.length - 1));
                    event.target.value = event.target.value.slice(0, -1);
                    fade_out(comments_error);
                    mis_input(event);
                }
            }   
        }
        if(id_split === 'comments') {
            comments_info.innerHTML = `${event.target.getAttribute('maxlength') - event.target.value.length} character(s) left!`;
         }
    }

    async function mis_input(event) {
        event.target.classList.add('invalid');
        await new Promise(x => setTimeout(x, 300));
        event.target.classList.remove('invalid');
    }

    async function fade_out(element) {
        element.classList.add('error-message');
        await new Promise(x => setTimeout(x, 1900));
        element.classList.remove('error-message');
        element.innerHTML = '';
    }

    function add_error(char) {
        form_errors_array.push(char);
        form_errors.value = form_errors_array;
    }
});