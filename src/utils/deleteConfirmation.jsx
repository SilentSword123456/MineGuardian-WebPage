import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/animate-ui/components/radix/alert-dialog";

export default function DeleteConfirmation({ onConfirm }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger className="delete-confirmation-trigger">Uninstall server</AlertDialogTrigger>
            <AlertDialogContent className="delete-confirmation-content">
                <AlertDialogHeader>
                    <AlertDialogTitle className="delete-confirmation-title">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="delete-confirmation-description">This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="delete-confirmation-cancel">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="delete-confirmation-action" onClick={onConfirm}>Uninstall</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}