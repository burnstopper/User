import React from "react"
import "./SignInForm.css"
import { Button } from "react-bootstrap"
import "bootstrap/dist/js/bootstrap.js"
import axios from "axios"
import CookieLib from "../../cookielib/index.js"

let mode = 'signup'
let contact_type = 'email'

function switchToEmail() { // ADD A CONTACT_FLAG
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

function switchMode() { // ADD A MODE_FLAG
    if (mode === 'signup') {  // check by mode
        /*let content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('text_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Авторизоваться';*/
        mode = 'login'
        window.location.pathname = '/login'
    } else {
        /*let content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('text_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Зарегистрироваться';*/
        mode = 'signup'
        window.location.pathname = '/signup'
    }
}

async function handleSubmitClick() { // ADD A MODE_FLAG
    let content = document.getElementById('text_mode');
    content.innerHTML = 'На вашу почту отправлено письмо подтверждения'; // а если не почта а тг???
    content = document.getElementById('email');
    content.style.display='none';
    content = document.getElementById('tg');
    content.style.display='none';
    content = document.getElementById('button_switch_mode');
    content.style.display='none';
    content = document.getElementById('button_return');
    //let input;
    let data;
    if (contact_type === 'email') {
        content.innerHTML = 'Ввести почту заново'
        // get input data for mail
        /*input = document.getElementById('email_input');
        data = input.value;*/
        data = document.getElementById('email_input').value;
    } else {
        // get input data for tg
        content.innerHTML = 'Ввести юзернейм заново'
        /*input = document.getElementById('tg_input');
        data = input.value;*/
        data = document.getElementById('tg_input').value;
    }
    content.style.display='flex';
    content = document.getElementById('button_submit');
    content.innerHTML = 'Отправить письмо еще раз'
    // send email to given address and receive new token for cookies
    if (mode === 'signup') {
        let token = CookieLib.getCookieToken();
        //console.log(token);
        if (token === undefined) {  // if undefined, post request to user to trigger anonymous registration
            await axios.post('http://127.0.0.1/new_token', {})
            //await axios.post('http://127.0.0.1/new-token', {})
                .then((response) => {
                    console.log(response);
                    //console.log(response.status);
                    token = response.data // ?????????
                    CookieLib.setCookieToken(token)
                    //console.log(CookieLib.getCookieToken());
                })
                .catch((error) => {
                    console.log(error.response.status);
                    //console.log(CookieLib.getCookieToken());
                });
        }
        //console.log(CookieLib.getCookieToken());
        //CookieLib.removeCookie();
        axios.post("http://127.0.0.1/registration", {
            email_address: data,
        }, {
            params: {
                //user_token: ',vnbsdkjbfojvs;mb;fl',
                user_token: token,
            },
        })
            .then((response) => {
                console.log(response);
            });
    } else {
        axios.post("http://127.0.0.1/login", { // no params for login?
                email_address: data,
            })
            .then((response) => {
                console.log(response);
            });
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
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Авторизация'
    } else {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Авторизоваться'
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Регистрация'
    }
    if (contact_type === 'email') {
        content = document.getElementById('email');
        content.style.display='flex';
    } else {
        content = document.getElementById('tg');
        content.style.display='flex';
    }
    content = document.getElementById('button_switch_mode');
    content.style.display='flex';
    content = document.getElementById('button_return');
    content.style.display='none';
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
