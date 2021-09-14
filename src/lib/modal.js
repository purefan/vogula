
/**
 * Standard behavior for the modal popup
 */

const Modal = {
    state: 'hidden',
    content: 'Not set yet',
    view: () => m('div', { class: `modal ${Modal.state}` }, [
        m('div.modal-content', [
            m('button.close-modal', { onclick: e => Modal.state = 'hidden' }, 'Close'),
            Modal.content ])
    ])
}

export default Modal