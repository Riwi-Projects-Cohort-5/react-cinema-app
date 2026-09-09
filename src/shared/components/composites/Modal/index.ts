import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";

// Tipar el Modal con sus subcomponentes
type ModalComponent = typeof Modal & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

const ModalWithSubcomponents = Modal as ModalComponent;
ModalWithSubcomponents.Header = ModalHeader;
ModalWithSubcomponents.Body = ModalBody;
ModalWithSubcomponents.Footer = ModalFooter;

export default ModalWithSubcomponents;
export { ModalHeader, ModalBody, ModalFooter };
