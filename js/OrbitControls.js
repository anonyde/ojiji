// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class OrbitControls extends THREE.EventDispatcher {
    constructor(object, domElement) {
        super();
        
        this.object = object;
        this.domElement = domElement;
        this.enabled = true;
        this.target = new THREE.Vector3();
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.enableDamping = false;
        this.dampingFactor = 0.05;
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = true;
        this.keyPanSpeed = 7.0;
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0;
        this.keys = {
            LEFT: 'ArrowLeft',
            UP: 'ArrowUp',
            RIGHT: 'ArrowRight',
            BOTTOM: 'ArrowDown'
        };
        this.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        this.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;

        // the target DOM element for key events
        this._domElementKeyEvents = null;

        //
        // internals
        //

        const scope = this;

        const STATE = {
            NONE: - 1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_PAN: 4,
            TOUCH_DOLLY_PAN: 5,
            TOUCH_DOLLY_ROTATE: 6
        };

        let state = STATE.NONE;

        const EPS = 0.000001;

        // current position in spherical coordinates
        const spherical = new THREE.Spherical();
        const sphericalDelta = new THREE.Spherical();

        let scale = 1;
        const panOffset = new THREE.Vector3();
        let zoomChanged = false;

        const rotateStart = new THREE.Vector2();
        const rotateEnd = new THREE.Vector2();
        const rotateDelta = new THREE.Vector2();

        const panStart = new THREE.Vector2();
        const panEnd = new THREE.Vector2();
        const panDelta = new THREE.Vector2();

        const dollyStart = new THREE.Vector2();
        const dollyEnd = new THREE.Vector2();
        const dollyDelta = new THREE.Vector2();

        function getAutoRotationAngle() {
            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        }

        function getZoomScale() {
            return Math.pow(0.95, scope.zoomSpeed);
        }

        let sphericalDeltaX = 0;
        let sphericalDeltaY = 0;

        const offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        const quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();

        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();

        const position = scope.object.position;

        this.update = function() {
            offset.copy(position).sub(scope.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis
            spherical.setFromVector3(offset);

            if (scope.autoRotate && state === STATE.NONE) {
                sphericalDeltaX += getAutoRotationAngle();
            }

            spherical.theta += sphericalDeltaX;
            spherical.phi += sphericalDeltaY;

            // restrict theta to be between desired limits
            spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

            // restrict phi to be between desired limits
            spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

            spherical.makeSafe();

            spherical.radius *= scale;

            // restrict radius to be between desired limits
            spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

            // move target to panned location
            scope.target.add(panOffset);

            offset.setFromSpherical(spherical);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(scope.target).add(offset);

            scope.object.lookAt(scope.target);

            if (scope.enableDamping === true) {
                sphericalDeltaX *= (1 - scope.dampingFactor);
                sphericalDeltaY *= (1 - scope.dampingFactor);
                panOffset.multiplyScalar(1 - scope.dampingFactor);
            } else {
                sphericalDeltaX = 0;
                sphericalDeltaY = 0;
                panOffset.set(0, 0, 0);
            }

            scale = 1;

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (lastPosition.distanceToSquared(scope.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
                scope.dispatchEvent(_changeEvent);
                lastPosition.copy(scope.object.position);
                lastQuaternion.copy(scope.object.quaternion);
                return true;
            }

            return false;
        };

        function handleMouseDownRotate(event) {
            rotateStart.set(event.clientX, event.clientY);
        }

        function handleMouseMoveRotate(event) {
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

            const element = scope.domElement;

            // Invert the rotation directions by adding negative signs
            sphericalDeltaX = -2 * Math.PI * rotateDelta.x / element.clientHeight;
            sphericalDeltaY = -2 * Math.PI * rotateDelta.y / element.clientHeight;

            rotateStart.copy(rotateEnd);
            scope.update();
        }

        function onMouseMove(event) {
            if (scope.enabled === false) return;

            event.preventDefault();

            if (state === STATE.ROTATE) {
                if (scope.enableRotate === false) return;
                handleMouseMoveRotate(event);
            }
        }

        function onMouseDown(event) {
            if (scope.enabled === false) return;

            event.preventDefault();

            if (event.button === 0) {
                if (scope.enableRotate === false) return;
                handleMouseDownRotate(event);
                state = STATE.ROTATE;
            }

            if (state !== STATE.NONE) {
                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);
                scope.dispatchEvent(_startEvent);
            }
        }

        function onMouseUp() {
            if (scope.enabled === false) return;

            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(_endEvent);
            state = STATE.NONE;
        }

        function onMouseWheel(event) {
            if (scope.enabled === false || scope.enableZoom === false) return;

            event.preventDefault();

            if (event.deltaY < 0) {
                scale /= getZoomScale();
            } else if (event.deltaY > 0) {
                scale *= getZoomScale();
            }

            scope.update();
            scope.dispatchEvent(_startEvent);
            scope.dispatchEvent(_endEvent);
        }

        function onContextMenu(event) {
            if (scope.enabled === false) return;
            event.preventDefault();
        }

        scope.domElement.addEventListener('contextmenu', onContextMenu);
        scope.domElement.addEventListener('mousedown', onMouseDown);
        scope.domElement.addEventListener('wheel', onMouseWheel);

        // force an update at start
        this.update();
    }
}

// Define THREE.MOUSE and THREE.TOUCH if not already defined
if (!THREE.MOUSE) {
    THREE.MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
}

if (!THREE.TOUCH) {
    THREE.TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };
}

// Make OrbitControls available as THREE.OrbitControls
THREE.OrbitControls = OrbitControls;
