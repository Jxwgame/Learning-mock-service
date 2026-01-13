
import Swal from 'sweetalert2';

// Modern Premium Theme Colors
const theme = {
    success: '#10b981', // Emerald
    error: '#ef4444',   // Rose/Red
    info: '#3b82f6',    // Blue
    warning: '#f59e0b', // Amber
    confirm: '#0f172a', // Slate
    cancel: '#94a3b8',  // Slate Regular
};
const toastConfig = {
    toast: true,
    position: 'top-end' as const,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutRight animate__faster'
    },
    customClass: {
        popup: 'premium-toast-popup premium-swal-z',
        title: 'premium-toast-title',
    }
};

const dialogConfig = {
    confirmButtonColor: theme.confirm,
    cancelButtonColor: theme.cancel,
    reverseButtons: true,
    showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
    },
    customClass: {
        popup: 'rounded-2xl shadow-xl border-none premium-swal-z',
        confirmButton: 'px-4 py-2 rounded-xl font-semibold',
        cancelButton: 'px-4 py-2 rounded-xl font-semibold',
    }
};

// Show success toast notification
export function showSuccess(title: string, text?: string) {
    return Swal.fire({
        ...toastConfig,
        icon: 'success',
        iconColor: theme.success,
        title,
        text,
        timer: 2500,
    });
}

// Show error toast notification
export function showError(title: string, text?: string) {
    return Swal.fire({
        ...toastConfig,
        icon: 'error',
        iconColor: theme.error,
        title,
        text,
        timer: 5000,
    });
}

//Show info toast notification
export function showInfo(title: string, text?: string) {
    return Swal.fire({
        ...toastConfig,
        icon: 'info',
        iconColor: theme.info,
        title,
        text,
    });
}

// Show confirmation dialog
export function showConfirm(
    title: string,
    text?: string,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    icon: 'question' | 'warning' | 'info' = 'question'
) {
    return Swal.fire({
        ...dialogConfig,
        title,
        text,
        icon,
        iconColor: icon === 'question' ? theme.confirm : (icon === 'warning' ? theme.warning : theme.info),
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
}

// Show delete confirmation dialog
export function showDeleteConfirm(
    itemName?: string,
    title = 'ยืนยันการลบ',
) {
    return Swal.fire({
        ...dialogConfig,
        title,
        text: itemName ? `คุณต้องการลบ "${itemName}" หรือไม่?` : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
        icon: 'warning',
        iconColor: theme.error,
        showCancelButton: true,
        confirmButtonText: 'ลบข้อมูล',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: theme.error,
    });
}

// Show input dialog
export function showInput(
    title: string,
    placeholder?: string,
    inputValue = ''
) {
    return Swal.fire({
        ...dialogConfig,
        title,
        input: 'text',
        inputValue,
        inputPlaceholder: placeholder,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        inputValidator: (value) => {
            if (!value) return 'กรุณากรอกข้อมูล';
            return null;
        },
    });
}

// Show loading dialog
export function showLoading(title = 'กำลังดำเนินการ...') {
    return Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
}

// Close any open dialog
export function closeDialog() {
    Swal.close();
}

export default {
    showSuccess,
    showError,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showInput,
    showLoading,
    closeDialog,
};
