window.northWindPdf = {
    toBlob: function (base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) {
            bytes[index] = binary.charCodeAt(index);
        }
        return new Blob([bytes], { type: "application/pdf" });
    },

    open: function (base64) {
        try {
            const blob = this.toBlob(base64);
            const url = URL.createObjectURL(blob);
            const win = window.open(url, "_blank");
            if (!win) {
                URL.revokeObjectURL(url);
                return false;
            }
            try { win.opener = null; } catch { }
            setTimeout(() => URL.revokeObjectURL(url), 120000);
            return true;
        } catch {
            return false;
        }
    },

    print: function (base64) {
        try {
            const blob = this.toBlob(base64);
            const url = URL.createObjectURL(blob);
            const win = window.open(url, "_blank");
            if (!win) {
                URL.revokeObjectURL(url);
                return false;
            }

            let printed = false;
            const requestPrint = function () {
                if (printed) return;
                printed = true;
                try {
                    win.focus();
                    win.print();
                } catch { }
                setTimeout(() => URL.revokeObjectURL(url), 120000);
            };

            win.addEventListener("load", function () {
                setTimeout(requestPrint, 900);
            }, { once: true });
            setTimeout(requestPrint, 1800);
            return true;
        } catch {
            return false;
        }
    },

    download: function (base64, fileName) {
        const blob = this.toBlob(base64);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};
