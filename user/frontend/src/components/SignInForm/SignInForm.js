import React from "react"
import "./SignInForm.css"
import "bootstrap/dist/js/bootstrap.js"
import axios from "axios"
import CookieLib from "../../cookielib/index.js"

let mode = 'signup'
let contact_type = 'email'
let status = 'await'

function switchMode() {
    if (mode === 'signup') {
        mode = 'login'
        window.location.pathname = '/login'
    } else {
        mode = 'signup'
        window.location.pathname = '/signup'
    }
}

function redirectQuestionnaire() {
	window.location.replace("http://185.46.11.65:8002/");
}

async function handleSubmitClick() {
    let data;
    data = document.getElementById('email_input').value;
    if (mode === 'signup') {
        let token = CookieLib.getCookieToken();
        if (token === undefined) {
            await axios.post('/new_token', {
            }).then(response => {
                token = response.data
                CookieLib.setCookieToken(token)
            }).catch(error => {
                status = 'error';
            });
        }
        await axios.post("/registration", {
            email_address: data,
        }, {
            params: {
                user_token: token,
            },
        }).then(response => {
            if (response.data === null) {
                status = 'success';
            } else {
                status = 'logged_in';
            }
        }).catch(error => {
            if (error.response.status === 422) {
                status = 'incorrect_format';
            } else if (error.response.status === 409) {
                status = 'signup_taken';
            } else {
                status = 'error';
            }
        });
    } else {
        await axios.post("/authorization", {
            email_address: data,
        }).then(response => {
            if (response.data === null) {
                status = 'success';
            } else {
                status = 'logged_in';
            }
        }).catch(error => {
            if (error.response.status === 422) {
                status = 'incorrect_format';
            } else if (error.response.status === 404) {
                status = 'login_nonexistent';
            } else {
                status = 'error';
            }
        });
    }
    let content = document.getElementById('email');
    content.style.display='none';

    if (status === 'logged_in') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Вы уже авторизованы.<br/>Тесты доступны на верхней панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.';

        content = document.getElementById('button_submit');
        content.style.display='none';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';

        content = document.getElementById('button_quiz');
        content.style.display='flex';


    } else if (status === 'signup_taken') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Введенная вами почта уже занята.';

        content = document.getElementById('button_submit');
        content.style.display='none';

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
        } else {
            content.innerHTML = 'Ввести юзернейм заново'
        }
        content.style.display='flex';

    } else if (status === 'login_nonexistent') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Данная почта не зарегистрирована.';

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
        } else {
            content.innerHTML = 'Ввести юзернейм заново'
        }
        content.style.display='flex';

        content = document.getElementById('button_submit');
        content.style.display='none';

    } else if (status === 'success') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'На вашу почту отправлено письмо подтверждения.';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';
        content = document.getElementById('button_return');

        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
        } else {
            content.innerHTML = 'Ввести юзернейм заново'
        }
        content.style.display='flex';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Отправить письмо еще раз'
    } else if (status === 'incorrect_format') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Некорректный формат email. Пожалуйста, введите почту заново.';

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
        } else {
            content.innerHTML = 'Ввести юзернейм заново'
        }
        content.style.display='flex';

        content = document.getElementById('button_submit');
        content.style.display='none';
    } else {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Произошла ошибка. Пожалуйста, попробуйте позднее.';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';
        content = document.getElementById('button_return');
        content.style.display='none';
        content = document.getElementById('button_submit');
        content.style.display='none';
    }
}

function handleReturnClick() {
    let content = document.getElementById('button_return');
    content.style.display='none';
    if (mode === 'signup') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Зарегистрироваться'
        content.style.display='flex';
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Авторизация'
    } else {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Авторизоваться'
        content.style.display='flex';
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Регистрация'
    }
    content = document.getElementById('email');
    content.style.display='flex';

    content = document.getElementById('button_switch_mode');
    content.style.display='flex';
}

const SignInForm = ({ handleClick }) => {
    let queryString = window.location.pathname;
    if (queryString === '/signup') {
        mode = 'signup';
        return (
            <div className="content">
                <div className="frame">
                    <div className="mode_toggle">
                        <button className="btn_outline" id="button_switch_mode" onClick={switchMode}>Авторизация</button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Регистрация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false" id="type">Email
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <button className="btn_default" id="button_submit" onClick={handleSubmitClick}>
                            Зарегистрироваться
                        </button>
                    </div>
                    <button className="btn_default" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </button>
                    <button className="btn_default" onClick={redirectQuestionnaire} id="button_quiz" style={{display:'none'}}>
                        Заполнить анкету
                    </button>
                </div>
            </div>
        )
    } else {
        mode = 'login';
        return (
            <div className="content">
                <div className="frame">
                    <div className="mode_toggle">
                        <button className="btn_outline" id="button_switch_mode" onClick={switchMode}>Регистрация</button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Авторизация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Email
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <button className="btn_default" id="button_submit" onClick={handleSubmitClick}>
                            Авторизоваться
                        </button>
                    </div>
                    <button className="btn_default" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </button>
                    <button className="btn_default" onClick={redirectQuestionnaire} id="button_quiz" style={{display:'none'}}>
                        Заполнить анкету
                    </button>
                </div>
            </div>
        )
    }
}

export default SignInForm
