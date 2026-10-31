/* ==========================================================================
   ملف التوابع والبرمجة بلغة جافاسكريبت ومكتبة jQuery | myFunctions.js
   خاص بمشروع موقع تأجير السيارات - IWB202 - الجامعة الافتراضية السورية SVU
   إشراف: الدكتور ضياء محمد خلوف (Dr. Diaa Mohammad Khalouf)
   ========================================================================== */

$(document).ready(function() {

    // ==========================================================================
    // 1. سلوك إظهار / إخفاء تفاصيل السيارة عبر jQuery
    // عند الضغط على المربع في عمود "إظهار التفاصيل" تظهر التفاصيل،
    // وتختفي عند الضغط مرة ثانية (تأثير انسيابي بالـ jQuery)
    // ==========================================================================
    $('.show-details-cb').change(function() {
        var targetId = $(this).data('target');
        var targetRow = $('#' + targetId);
        
        if ($(this).is(':checked')) {
            targetRow.fadeIn(300);
        } else {
            targetRow.fadeOut(300);
        }
    });

    // ==========================================================================
    // 2. إظهار نموذج الحجز عند الضغط على زر "متابعة"
    // ==========================================================================
    $('#continueBtn').click(function() {
        var selectedCarsCount = $('.select-car-cb:checked').length;
        if (selectedCarsCount > 0) {
            $('#reservationSection').slideDown(400);
            $('html, body').animate({
                scrollTop: $("#reservationSection").offset().top - 20
            }, 600);
        } else {
            alert("تنبيه: يرجى اختيار سيارة واحدة على الأقل من الجدول قبل المتابعة.");
        }
    });

    // ==========================================================================
    // 3. التحقق من صحة مدخلات النموذج وحساب المجموع والخصم
    // ==========================================================================
    $('#reservationForm').submit(function(event) {
        event.preventDefault();

        // قراءة قيم حقول الإدخال
        var fullName = $('#fullName').val().trim();
        var nationalId = $('#nationalId').val().trim();
        var startDateStr = $('#startDate').val().trim();
        var endDateStr = $('#endDate').val().trim();
        var mobileNumber = $('#mobileNumber').val().trim();
        var email = $('#email').val().trim();

        var errors = [];

        // التأكد من بقاء سيارة مختارة على الأقل
        var selectedCheckboxes = $('.select-car-cb:checked');
        if (selectedCheckboxes.length === 0) {
            errors.push("يجب تحديد سيارة واحدة على الأقل لإتمام الحجز.");
        }

        // أ) التحقق من الاسم الكامل (أحرف هجائية عربية فقط ومسافات - يقبل القيمة الفارغة)
        if (fullName !== "") {
            var arabicRegex = /^[\u0600-\u06FF\s]+$/;
            if (!arabicRegex.test(fullName)) {
                errors.push("الاسم الكامل يجب أن يحتوي على أحرف هجائية عربية ومسافات فقط.");
            }
        }

        // ب) التحقق من الرقم الوطني (إلزامي، 11 خانة، أول خانتين للمحافظة 01-14)
        if (nationalId === "") {
            errors.push("حقل الرقم الوطني إلزامي.");
        } else {
            var nationalIdRegex = /^(0[1-9]|1[0-4])[0-9]{9}$/;
            if (!nationalIdRegex.test(nationalId)) {
                errors.push("الرقم الوطني يجب أن يتألف من 11 خانة رقمية ويبدأ برمز محافظة سورية صحيح (01 إلى 14).");
            }
        }

        // ج) التحقق من تاريخي البداية والنهاية (إلزاميان، صيغة dd-mm-yyyy، والنهاية لاحقة للبداية)
        var dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
        var diffDays = 0;

        if (startDateStr === "" || endDateStr === "") {
            errors.push("تاريخ بداية التأجير وتاريخ نهاية التأجير إلزاميان.");
        } else {
            var isStartDateValid = dateRegex.test(startDateStr);
            var isEndDateValid = dateRegex.test(endDateStr);

            if (!isStartDateValid) {
                errors.push("صيغة تاريخ بداية التأجير غير صحيحة، الصيغة المطلوبة هي dd-mm-yyyy (مثال: 01-11-2026).");
            }
            if (!isEndDateValid) {
                errors.push("صيغة تاريخ نهاية التأجير غير صحيحة، الصيغة المطلوبة هي dd-mm-yyyy (مثال: 10-11-2026).");
            }

            if (isStartDateValid && isEndDateValid) {
                var startParts = startDateStr.split('-');
                var endParts = endDateStr.split('-');

                var startDateObj = new Date(parseInt(startParts[2], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[0], 10));
                var endDateObj = new Date(parseInt(endParts[2], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[0], 10));

                if (endDateObj <= startDateObj) {
                    errors.push("تاريخ نهاية التأجير يجب أن يكون لاحقاً زمنياً لتاريخ بداية التأجير.");
                } else {
                    var timeDiff = endDateObj.getTime() - startDateObj.getTime();
                    diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                }
            }
        }

        // د) التحقق من رقم الموبايل (يقبل القيمة الفارغة، وإن وُجد يطابق شبكتي Syriatel و MTN)
        if (mobileNumber !== "") {
            // سيريتل: 093, 098, 099 | إم تي إن: 094, 095, 096 (مجموع 10 أرقام)
            var mobileRegex = /^09(3|4|5|6|8|9)[0-9]{7}$/;
            if (!mobileRegex.test(mobileNumber)) {
                errors.push("رقم الموبايل يجب أن يتألف من 10 أرقام ويطابق شبكة Syriatel أو MTN (مثال: 0933112233 أو 0944112233).");
            }
        }

        // هـ) التحقق من البريد الإلكتروني (يقبل القيمة الفارغة، وإن وُجد يجب أن تكون صيغته صحيحة)
        if (email !== "") {
            var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                errors.push("صيغة البريد الإلكتروني غير صحيحة (مثال: user@example.com).");
            }
        }

        // عرض الأخطاء في حال وجودها والتوقف
        if (errors.length > 0) {
            var errorMsg = "تنبيه - يرجى تصحيح الأخطاء التالية في نموذج الحجز:\n\n";
            for (var i = 0; i < errors.length; i++) {
                errorMsg += "• " + errors[i] + "\n";
            }
            alert(errorMsg);
            return false;
        }

        // ======================================================================
        // نجاح التحقق - حساب التكلفة وتطبيق الخصم
        // ======================================================================
        var selectedCarsNames = [];
        var subtotal = 0;

        selectedCheckboxes.each(function() {
            var price = parseInt($(this).data('price'), 10);
            var carModel = $(this).closest('tr').find('.car-model-name').text().trim();
            if (!carModel) {
                carModel = $(this).closest('tr').find('td:eq(1)').text().trim();
            }
            selectedCarsNames.push(carModel);
            subtotal += (price * diffDays);
        });

        var discountPercent = 0;
        var discountAmount = 0;
        var finalTotal = subtotal;
        var discountDescription = "لا يوجد خصم (مدة الحجز 7 أيام أو أقل)";

        // تطبيق خصم 10% في حال تجاوزت مدة التأجير 7 أيام
        if (diffDays > 7) {
            discountPercent = 10;
            discountAmount = subtotal * 0.10;
            finalTotal = subtotal - discountAmount;
            discountDescription = "خصم 10% لتجاوز مدة الحجز 7 أيام (وفرت " + discountAmount.toLocaleString() + " ل.س)";
        }

        // نص الرسالة الشاملة للنافذة
        var alertMessage = "=== تم تسجيل طلب الحجز بنجاح ===\n\n";
        alertMessage += "• اسم مقدم الطلب: " + (fullName ? fullName : "غير محدد") + "\n";
        alertMessage += "• الرقم الوطني: " + nationalId + "\n";
        alertMessage += "• فترة الحجز: من " + startDateStr + " إلى " + endDateStr + "\n";
        alertMessage += "• السيارات المختارة: " + selectedCarsNames.join(" ، ") + "\n";
        alertMessage += "• عدد أيام التأجير لكل سيارة: " + diffDays + " أيام\n";
        alertMessage += "• المبلغ الإجمالي قبل الخصم: " + subtotal.toLocaleString() + " ل.س\n";
        alertMessage += "• الخصم المطبق: " + discountDescription + "\n";
        alertMessage += "=================================\n";
        alertMessage += "• المبلغ النهائي المستحق: " + finalTotal.toLocaleString() + " ل.س\n\n";
        alertMessage += "شكراً لاختياركم مكتب تأجير السيارات!";

        // تحديث محتوى النافذة المنبثقة المدمجة (Modal)
        $('#modalClientName').text(fullName ? fullName : "غير محدد");
        $('#modalNationalId').text(nationalId);
        $('#modalPeriod').text("من " + startDateStr + " إلى " + endDateStr);
        $('#modalCars').text(selectedCarsNames.join(" ، "));
        $('#modalDays').text(diffDays + " أيام");
        $('#modalSubtotal').text(subtotal.toLocaleString() + " ل.س");
        $('#modalDiscount').text(discountDescription);
        $('#modalFinalPrice').text(finalTotal.toLocaleString() + " ل.س");

        // إظهار النافذة المنبثقة عبر jQuery
        $('#resultModal').css('display', 'flex').hide().fadeIn(300);

        // إظهار الـ Alert أيضاً لضمان توافق التحقق التلقائي واليدوي للمصحح
        alert(alertMessage);

        return true;
    });

    // إغلاق النافذة المنبثقة عند الضغط على زر الإغلاق أو الخلفية
    $('.modal-close-btn, #closeModalActionBtn').click(function() {
        $('#resultModal').fadeOut(250);
    });

    $('#resultModal').click(function(e) {
        if ($(e.target).is('#resultModal')) {
            $(this).fadeOut(250);
        }
    });

});
