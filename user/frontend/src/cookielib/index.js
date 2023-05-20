import Cookies from "js-cookie";
import "./index.css"

function hideCookieFooter() {
    let content = document.getElementById('footer');
    content.style.display='none';
}

function getCookieToken() {
    return Cookies.get("token");
}

const CookieFooter = () => {
    let token = getCookieToken();
    if (token === undefined) {
        return (
            <div className="cookie_footer" id="footer">
                <div className="cookie_footer_text">
                    Этот сайт использует необходимые cookie. Продолжая пользоваться сервисом, вы даете согласие на их установку.
                </div>
                <div className="button_container">
                    <button className="btn_default" onClick={hideCookieFooter}>
                        Я понимаю и хочу продолжить
                    </button>
                </div>
            </div>
        )
    }
}

let exp = {
    getCookieToken,
    setCookieToken: (token) => {
        Cookies.set("token", token, { expires: 365, /*secure: true*/ });
    },
    removeCookie: () => {
        Cookies.remove("token"/*, { secure: true }*/);
    },
    CookieFooter,
};

export default exp;
