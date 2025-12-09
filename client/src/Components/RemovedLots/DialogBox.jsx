import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

export default function AlertDialog(props) {
  const { open, setOpen, confirmMessage, handleConfirm } = props;

  const handleClose = () => setOpen(false);
  const handleCloseWithConfirm = () => {
    setOpen(false);
    handleConfirm();
  };

  return (
    <div className="rl-dialog-wrap">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-describedby="alert-dialog-description"
        PaperProps={{
          className: "rl-dialog-paper"  // <-- this isolates the whole popup
        }}
      >
        <DialogContent className="rl-dialog-content">
          <DialogContentText
            id="alert-dialog-description"
            className="rl-dialog-text"
          >
            {confirmMessage}
          </DialogContentText>
        </DialogContent>

        <DialogActions className="rl-dialog-actions">
          <Button className="rl-dialog-btn rl-dialog-cancel" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            className="rl-dialog-btn rl-dialog-confirm"
            onClick={handleCloseWithConfirm}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
