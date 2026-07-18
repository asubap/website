import { useState, useCallback } from "react";
import type { ConfirmDialogInfo } from "../adminTypes";

const initial: ConfirmDialogInfo = {
  isOpen: false,
  title: "",
  message: "",
  onConfirm: () => {},
};

export function useConfirmDialog() {
  const [info, setInfo] = useState<ConfirmDialogInfo>(initial);

  const show = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      setInfo({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setInfo((p) => ({ ...p, isOpen: false }));
        },
        confirmText,
        cancelText,
      });
    },
    []
  );

  const close = useCallback(
    () => setInfo((p) => ({ ...p, isOpen: false })),
    []
  );

  return { info, show, close };
}
