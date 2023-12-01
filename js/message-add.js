document.addEventListener("DOMContentLoaded", (event) => {
    let theme_picker = document.querySelector('body main section #nav-holder #theme-picker');
    let div = document.createElement('div');
    theme_picker.removeChild(theme_picker.querySelector('p'));
    div.innerHTML = '<label>Mode Toggle:<input type="checkbox" id="color-theme-toggle"></label><label>Left Background Color:<input type="color" id="left-background-color"></label><label>Left Text Color:<input type="color" id="left-text-color"></label><label>Right Background Color:<input type="color" id="right-background-color"></label><label>Right Text Color:<input type="color" id="right-text-color"></label><button type="button" id="reset-theme">Reset Theme</button>';
    theme_picker.appendChild(div);
    div = null;

    let form = document.getElementsByTagName('form')[0];
    let name = form.querySelector('#contact-form-name');
    let email = form.querySelector('#contact-form-email');
    let message = form.querySelector('#contact-form-comments');
    let message_holder = document.querySelector('#message-wrapper');
    let root = document.querySelector(':root');
    let left_background_color = document.querySelector('#left-background-color');
    let left_text_color = document.querySelector('#left-text-color');
    let right_background_color = document.querySelector('#right-background-color');
    let right_text_color = document.querySelector('#right-text-color');
    let theme_toggle = document.querySelector('#color-theme-toggle');
    let reset_theme_button = document.querySelector('#reset-theme');
    
    let stored_theme = localStorage.getItem('theme') || null;

    let dark_mode_query = window.matchMedia('(prefers-color-scheme: dark)');

    dark_mode_query.addEventListener('change', dark_mode_listener);

    dark_mode_listener(dark_mode_query);

    theme_apply(stored_theme);

    get_existing_messages();

    left_background_color.addEventListener('input', change_color);
    left_text_color.addEventListener('input', change_color);
    right_background_color.addEventListener('input', change_color);
    right_text_color.addEventListener('input', change_color);
    theme_toggle.addEventListener('input', change_theme);
    reset_theme_button.addEventListener('click', reset_theme);

    document.getElementById('submit').addEventListener('click', (event) => {
        event.preventDefault();
        let time = new Date();
        let date_time = time.toString();
        let time_print = time.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
        let image_number = Math.floor(Math.random() * (15 - 1 + 1) + 1);
        let page = document.querySelector('section div#nav-holder details summary h2').innerHTML.slice(2);
        append_message(name.value, email.value, message.value, date_time, time_print, image_number, page);
        let stored_messages = JSON.parse(localStorage.getItem('messages') || null); 
        let new_message = {'name': name.value, 'email': email.value, 'message': message.value, 'time': date_time, 'time_to_print': time_print, 'img': image_number, 'page': page};
        if (stored_messages === null) {
            stored_messages = [new_message];
        } else {
            stored_messages = stored_messages.concat(new_message);
        }
        localStorage.setItem('messages', JSON.stringify(stored_messages));
        time = null;
        date_time = null;
        time_print = null;
        image_number = null;
        page = null;
        stored_messages = null;
        new_message = null;
        form.reset();
    });

    document.addEventListener('keydown', (event) => {
        if(event.key === 'Escape') {
            if(theme_picker.getAttribute('open') !== null) {
                theme_picker.removeAttribute('open');
            }
        }
    });

    document.addEventListener('click', (event) => {
        if(theme_picker.contains(event.target) === false) {
            if(theme_picker.getAttribute('open') !== null) {
                theme_picker.removeAttribute('open');
            }
        }
    });

    document.getElementById('remove-messages').addEventListener('click', (event) => {
        let messages = JSON.parse(localStorage.getItem('messages'));
        let page = document.querySelector('section div#nav-holder details summary h2').innerHTML.slice(2);
        let new_messages = [];
        for(let i = 0; i < messages.length; i++) {
            if(messages[i].page != page) {
                new_messages.push(messages[i]);
            }
        }
        let nodes = document.querySelectorAll('[data-email]');
        for (let i = 0; i < nodes.length; i++) {
            message_holder.removeChild(nodes[i]);
        }
        localStorage.setItem('messages', JSON.stringify(new_messages));
        messages = null;
        page = null;
        new_messages = null;
        nodes = null;
    });

    function append_message(name, email, comment, time, time_to_print, image_number, page) {
        if(page === document.querySelector('section div#nav-holder details summary h2').innerHTML.slice(2)) {
            let clone = document.querySelector('template').content.cloneNode(true);
            let image = clone.querySelector('picture').querySelector('source');
            image.setAttribute('srcset', `assets/random/${image_number}.jpg`);
            clone.querySelector('.message').setAttribute('data-email', email);
            clone.querySelector('.message').setAttribute('data-page', page);
            clone.querySelector('img').setAttribute('alt', `Picture of ${name}`);
            clone.querySelector('.message-sender').innerHTML = `${name} <time datetime="${time.toString()}">${time_to_print}</time>`;
            clone.querySelector('.message-content').innerHTML = comment;
            message_holder.append(clone);
            image = null;
            clone = null;
        }
        
    }

    function get_existing_messages() {
        let message_list = JSON.parse(localStorage.getItem('messages') || null);
        let message;
        if (message_list !== null) {
            for(let i = 0; i < message_list.length; i++) {
                message = message_list[i];
                append_message(message.name, message.email, message.message, message.time, message.time_to_print, message.img, message.page);
            }
        }
        message = null;
        message_list = null;
    }

    function change_color(event) {
        let x = event.target.id.split('-');
        let temp = x[1] + '-' + x[2];
        if(x[0] === 'left') {
            if(temp === 'text-color') {
                if(theme_toggle.checked) {
                    root.style.setProperty('--left-text-color', event.target.value);
                    localStorage.setItem('dark--left-text-color', event.target.value);
                } else {
                    root.style.setProperty('--left-text-color', event.target.value);
                    localStorage.setItem('--left-text-color', event.target.value);
                }  
            } else if(temp === 'background-color') {
                if(theme_toggle.checked) {
                    root.style.setProperty('--left-color', event.target.value);
                    localStorage.setItem('dark--left-color', event.target.value);
                } else {
                    root.style.setProperty('--left-color', event.target.value);
                    localStorage.setItem('--left-color', event.target.value);
                }
            } else {
                console.log('Something went wrong when changing the color theme');
            }
        } else if(x[0] ==='right') {
            if(temp === 'text-color') {
                if(theme_toggle.checked) {
                    root.style.setProperty('--right-text-color', event.target.value);
                    localStorage.setItem('dark--right-text-color', event.target.value);
                } else {
                    root.style.setProperty('--right-text-color', event.target.value);
                    localStorage.setItem('--right-text-color', event.target.value);
                }  
            } else if(temp === 'background-color') {
                if(theme_toggle.checked) {
                    root.style.setProperty('--right-color', event.target.value);
                    localStorage.setItem('dark--right-color', event.target.value);
                } else {
                    root.style.setProperty('--right-color', event.target.value);
                    localStorage.setItem('--right-color', event.target.value);
                }
            } else {
                console.log('Something went wrong when changing the color theme');
            }
        }
        
    }

    function change_theme() {
        let theme = theme_toggle.checked ? 'dark' : 'light'
        theme_apply(theme);
    }

    function theme_apply(state) {
        localStorage.setItem('theme', state);
        if(state === 'dark') {
            theme_toggle.checked = true;
            root.style.setProperty('--left-color', localStorage.getItem('dark--left-color'));
            root.style.setProperty('--left-text-color', localStorage.getItem('dark--left-text-color'));
            root.style.setProperty('--right-color', localStorage.getItem('dark--right-color'));
            root.style.setProperty('--right-text-color', localStorage.getItem('dark--right-text-color'));
        } else if (state === 'light') {
            theme_toggle.checked = false;
            root.style.setProperty('--left-color', localStorage.getItem('--left-color'));
            root.style.setProperty('--left-text-color', localStorage.getItem('--left-text-color'));
            root.style.setProperty('--right-color', localStorage.getItem('--right-color'));
            root.style.setProperty('--right-text-color', localStorage.getItem('--right-text-color'));
        }
        apply_computed_style();
    }

    function reset_theme() {
        theme_toggle.checked = false;
        root.style.setProperty('--left-color', '#a80ea1');
        root.style.setProperty('--left-text-color', '#e0e0e0');
        root.style.setProperty('--right-color', '#f1f1f1');
        root.style.setProperty('--right-text-color', '#192525');
        localStorage.removeItem('--left-color');
        localStorage.removeItem('--left-text-color');
        localStorage.removeItem('--right-color');
        localStorage.removeItem('--right-text-color');
        localStorage.setItem('dark--left-color', '#454545');
        localStorage.setItem('dark--left-text-color', '#e0e0e0');
        localStorage.setItem('dark--right-color', '#6f6d6d');
        localStorage.setItem('dark--right-text-color', '#e0e0e0');
        apply_computed_style();
    }

    function apply_computed_style() {
        left_background_color.value = getComputedStyle(root).getPropertyValue('--left-color');
        left_text_color.value = getComputedStyle(root).getPropertyValue('--left-text-color');
        right_background_color.value = getComputedStyle(root).getPropertyValue('--right-color');
        right_text_color.value = getComputedStyle(root).getPropertyValue('--right-text-color');
    }

    function dark_mode_listener(mql) {
        if(mql.matches) {
            theme_apply('dark');
        } else {
            theme_apply('light');
        }
    }
});

