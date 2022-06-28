const BUTTON_ID = 'extension-open-unread';

const observer = new MutationObserver(() => {
    const parent = document.getElementsByClassName('MarkAsReadButton')[0]?.parentElement;

    if (parent && !parent.querySelector(`#${BUTTON_ID}`)) {
        addButton(parent);
    }
});

function addButton(parent) {
    const button = document.createElement('button');
    
    button.id = BUTTON_ID
    button.classList.add(...parent.querySelector('button').classList);
    button.innerHTML = 'Open unread';
    button.onclick = open;

    parent.insertBefore(button, parent.firstChild)
}


observer.observe(document.querySelector('body'), {
    childList: true,
    subtree: true
});

async function shouldConfirmManyTabs() {
    const storage = await browser.storage.local.get("suppressConfirm");
    return !storage.suppressConfirm;
}

async function shouldMarkRead() {
    const storage = await browser.storage.local.get("markRead");
    return storage.markRead;
}

async function open() {
    const unread = document.getElementsByClassName('entry--unread');

    if (unread.length >= 5 && await shouldConfirmManyTabs() && !confirm(`Are you sure you want to open ${unread.length} tabs`)) {
        return;
    }

    await Promise.all([...unread].map(x => browser.runtime.sendMessage({
        href: x.querySelector('a.entry__title').href
    })))

    if (await shouldMarkRead()) {
        const markAsReadDropdownTrigger = document.getElementsByClassName('MarkAsReadButton')[0];
        markAsReadDropdownTrigger.querySelector('button').click();

        await new Promise(resolve => requestAnimationFrame(resolve));

        const markAllAsReadItem = markAsReadDropdownTrigger.querySelector('li:nth-child(2)');
        markAllAsReadItem.click();
    }
}
