import React from "react"
import "./SignInForm.css"
import { Button } from "react-bootstrap"
import "bootstrap/dist/js/bootstrap.js"
import axios from "axios"
import CookieLib from "../../cookielib/index.js"

let mode = 'signup'
let contact_type = 'email'
let status = 'await'


function switchToEmail() {
    let item = document.getElementById('tg');
    item.style.display='none';
    item = document.getElementById('email');
    item.style.display='flex';
    contact_type = 'email'
}

function switchToTelegram() {
    let item = document.getElementById('email');
    item.style.display='none';
    item = document.getElementById('tg');
    item.style.display='flex';
    contact_type = 'tg'
}

function switchMode() {
    if (mode === 'signup') {
        mode = 'login'
        window.location.pathname = '/login'
    } else {
        mode = 'signup'
        window.location.pathname = '/signup'
    }
}

async function handleSubmitClick() {
    let data;
    if (contact_type === 'email') {
        data = document.getElementById('email_input').value;
    } else {
        data = document.getElementById('tg_input').value;
    }
    //requests
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

    content = document.getElementById('tg');
    content.style.display='none';

    if (status === 'logged_in') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Вы уже авторизованы.<br/>Тесты доступны на верхней панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.';

        content = document.getElementById('button_submit');
        content.style.display='none';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';

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
    //content.style.display='flex';
    if (contact_type === 'email') {
        content = document.getElementById('email');
        content.style.display='flex';
    } else {
        content = document.getElementById('tg');
        content.style.display='flex';
    }
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
                        <Button variant="outline-danger" id="button_switch_mode" onClick={switchMode}>Авторизация</Button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Регистрация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                            <li><button className="dropdown-item" onClick={switchToTelegram}>Telegram</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="input-group mb-3" id="tg">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Telegram</button></li>
                            <li><button className="dropdown-item" onClick={switchToEmail}>Email</button></li>
                        </ul>
                        <span className="input-group-text">@</span>
                        <input type="text" className="form-control" placeholder="Username" id="tg_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <Button variant="success" id="button_submit" onClick={handleSubmitClick}>
                            Зарегистрироваться
                        </Button>
                    </div>
                    <Button variant="success" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </Button>
                </div>
            </div>
        )
    } else {
        mode = 'login';
        return (
            <div className="content">
                <div className="frame">
                    <div className="mode_toggle">
                        <Button variant="outline-danger" id="button_switch_mode" onClick={switchMode}>Регистрация</Button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Авторизация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                            <li><button className="dropdown-item" onClick={switchToTelegram}>Telegram</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="input-group mb-3" id="tg">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Telegram</button></li>
                            <li><button className="dropdown-item" onClick={switchToEmail}>Email</button></li>
                        </ul>
                        <span className="input-group-text">@</span>
                        <input type="text" className="form-control" placeholder="Username" id="tg_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <Button variant="success" id="button_submit" onClick={handleSubmitClick}>
                            Авторизоваться
                        </Button>
                    </div>
                    <Button variant="success" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </Button>
                </div>
            </div>
        )
    }
}

export default SignInForm
