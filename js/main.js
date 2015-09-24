// Когда DOM-дерево отрисовано, выполняем код скрипта
jQuery(document).ready(function(){
	// Заносим в переменные элементы, к которым мы будем обращаться, чтобы каждый раз не сканировать DOM-дерево
	var modalTriggerBts = $('a[data-type="modal-trigger"]'), // Забираем в переменную ссылку с указанным data-атрибутом
		coverLayer = $('.cover-layer'); // А в другую переменную складываем блок .cover-layer

	var duration = 600, // Продолжительность анимации в миллисекундах - увеличь, чтобы лучше понять, что происходит на странице (вторая часть анимации зависит от переменной $animation-duration в файле _variables.scss)
		epsilon = (1000 / 60 / duration) / 4, // Точность вычислений, зависящая от величины продолжительности анимации
		firstCustomMinaAnimation = bezier(.63,.35,.48,.92, epsilon); // Задаем функцию Безье, которая определяет вид перехода. Для этого используем функцию bezier(), объявленную ниже по коду

	modalTriggerBts.each(function(){ // Тут мы перебираем все кнопки 
		initModal($(this)); // и для каждой из них запускаем функцию initModal, передавая параметром ссылку на текущую кнопку посредством $(this)
	});

	function initModal(modalTrigger) {
		var modalTriggerId =  modalTrigger.attr('id'), // Атрибут id кнопки, переданной в функцию
			modal = $('.modal[data-modal="'+ modalTriggerId +'"]'), // Формируем селектор модального окна, который будет вызываться при клике на кнопку. Так сделано для того, чтобы придать коду гибкость (например, у нас ведь на странице или в проекте вообще может быть несколько кнопок и соответствующих им модальных окон)
			svgCoverLayer = modal.children('.svg-bg'), // Селектор слоя-прокладки
			paths = svgCoverLayer.find('path'), // Ищем все path'ы, которыми создается эффект съезжания кусков фона
			pathsArray = []; // Пустой массив, в котором будут складироваться id'шники всех path'ов на странице (см. следующие три инструкции)

		// Сохраняем вышеназванные айдшники в массив (нужно для работы Snap.svg)
		pathsArray[0] = Snap('#'+paths.eq(0).attr('id')), // В каждом элементе массива сохраняется значение идентификатора, предваренное символом решетки
		pathsArray[1] = Snap('#'+paths.eq(1).attr('id')), // Если рассматривать как это происходит, то сначала берем очередной элемент из переменной paths, используя jQuery-функцию .eq()
		pathsArray[2] = Snap('#'+paths.eq(2).attr('id')); // а затем забираем его id без решетки через .attr()

		// Сохраняем из data-атрибутов в массив pathSteps значения шагов для атрибута "d", который мы будем позже анимировать. Для их получения используем jQ-функцию .data()
		var pathSteps = [];
		pathSteps[0] = svgCoverLayer.data('step1');
		pathSteps[1] = svgCoverLayer.data('step2');
		pathSteps[2] = svgCoverLayer.data('step3');
		pathSteps[3] = svgCoverLayer.data('step4');
		pathSteps[4] = svgCoverLayer.data('step5');
		pathSteps[5] = svgCoverLayer.data('step6');

		// Везываем событие клика по текущей кнопке, чтобы открывать наше модальное окно
		modalTrigger.on('click', function(event){
			event.preventDefault(); // Предотвращаем стандартное действие перехода по ссылке для элемента <a>
			modal.addClass('modal-is-visible'); // Добавим класс, указывающий что элемент видим
			coverLayer.addClass('modal-is-visible'); // И сюда
			animateModal(pathsArray, pathSteps, duration, 'open'); // Запускаем функцию animateModal, объявленную ниже, и передаем параметры, чтобы запустилась нужная анимация
		});

		modal.on('click', '.modal-close', function(event){ // если клик происходит по кнопке "X", запускаем процесс закрытия модального окна
			event.preventDefault(); // Предотвращаем стандартное поведение для <a>
			modal.removeClass('modal-is-visible'); // Удаляем класс видимости
			coverLayer.removeClass('modal-is-visible'); // И тут тоже
			animateModal(pathsArray, pathSteps, duration, 'close'); // Запускаем анимацию закрытия
		});
	}

	/* Фунция запуска анимации */
	function animateModal(paths, pathSteps, duration, animationType) {
		var path1 = ( animationType == 'open' ) ? pathSteps[1] : pathSteps[0], // Если тип анимации - открытие, то отдаем один вариант path'а, взятого из data-атрибута, в противном случае другой. Так как "съезжающихся" секций у нас в примере 3, то всего pathStep'ов шесть - по паре на закрывающую и открывающую анимацию. Тут, кстати, использована короткая запись оператора if.
			path2 = ( animationType == 'open' ) ? pathSteps[3] : pathSteps[2],
			path3 = ( animationType == 'open' ) ? pathSteps[5] : pathSteps[4];
		// А тут мы запускаем анимацию, используя функцию из библиотеки Snap.svg
		paths[0].animate({'d': path1}, duration, firstCustomMinaAnimation); // Передаем пару ключ-значение для атрибута, продолжительность анимации и timing-функцию в качестве параметров (подробнее смотри документацию к Snap.svg)
		paths[1].animate({'d': path2}, duration, firstCustomMinaAnimation);
		paths[2].animate({'d': path3}, duration, firstCustomMinaAnimation);
	}

	// Эта штука решает нам функцию Безье (она же timing-функция или функция перехода), которая описывает характер временнОго перехода при анимации. Её код взят тут: https://github.com/arian/cubic-bezier
	// Можно попробовать углубиться и понять что же там происходит - для тех кто силен в математике и искусстве анализа ;-)
	function bezier(x1, y1, x2, y2, epsilon){ // передаем несколько параметров - координаты двух точек и точность вычисления. Вот тут можно посмотреть, что такое функция Безье в графическом виде и координаты каких двух точек мы передаем: http://cubic-bezier.com/ - все наглядно видно.
		var curveX = function(t){
			var v = 1 - t;
			return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
		};

		var curveY = function(t){
			var v = 1 - t;
			return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
		};

		var derivativeCurveX = function(t){
			var v = 1 - t;
			return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
		};

		return function(t){

			var x = t, t0, t1, t2, x2, d2, i;

			// Пробуем решать Ньютоновским методом (также известным, как метод касательных). Обычно все проходит хорошо.
			for (t2 = x, i = 0; i < 8; i++){
				x2 = curveX(t2) - x;
				if (Math.abs(x2) < epsilon) return curveY(t2);
				d2 = derivativeCurveX(t2);
				if (Math.abs(d2) < 1e-6) break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0, t1 = 1, t2 = x;

			if (t2 < t0) return curveY(t0);
			if (t2 > t1) return curveY(t1);

			// Если Ньютновским не получается, то решаем методом бисекции (он же метод деления отрезка пополам). Это для надежности.
			while (t0 < t1){
				x2 = curveX(t2);
				if (Math.abs(x2 - x) < epsilon) return curveY(t2);
				if (x > x2) t0 = t2;
				else t1 = t2;
				t2 = (t1 - t0) * .5 + t0;
			}

			// Возвращаем при ошибке
			return curveY(t2);
		};
	};
});