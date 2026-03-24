(function () {
    var menuButton = document.querySelector('[data-mobile-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    var closeButton = document.querySelector('[data-mobile-menu-close]');
    var backdrop = document.querySelector('[data-mobile-menu-backdrop]');

    if (!menuButton || !menu || !closeButton || !backdrop) {
        return;
    }

    function setMenuState(open) {
        menu.classList.toggle('active', open);
        backdrop.classList.toggle('active', open);
        document.body.classList.toggle('mobile-menu-open', open);
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    menuButton.addEventListener('click', function () {
        setMenuState(!menu.classList.contains('active'));
    });

    closeButton.addEventListener('click', function () {
        setMenuState(false);
    });

    backdrop.addEventListener('click', function () {
        setMenuState(false);
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            setMenuState(false);
        });
    });

    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 992) {
            setMenuState(false);
        }
    });
}());
