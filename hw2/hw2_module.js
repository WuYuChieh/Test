function buildCar() {

	var ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({
	color: 0x00ad5f,
	side: THREE.DoubleSide
	}));
	ground.rotation.x = Math.PI / 2;
	scene.add(ground);

	const light = new THREE.PointLight("white");
	light.position.set(50, 50, 50);
	scene.add(light);


	var windscreen = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshPhongMaterial({
		color: 0x82fcff,
		side: THREE.DoubleSide
	}));
	windscreen.position.set(6.1, 7.5, 0);
	windscreen.rotation.y = Math.PI / 2;

	var licensePlate = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshPhongMaterial({
		color: "white",
		side: THREE.DoubleSide
	}));
	licensePlate.position.set(-7.6, 2, 0);
	licensePlate.rotation.y = Math.PI / 2;

	var carBody = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 10), new THREE.MeshPhongMaterial({
		color: 0x0058a1,
		shininess: 100
	}));
	carBody.position.set(0, 2.5, 0);

	var carHead = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 7), new THREE.MeshPhongMaterial({
		color: 0x006bfa,
		shininess: 100
	}));
	carHead.position.set(0, 7.5, 0);

	var smokesTack = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2, 32), new THREE.MeshPhongMaterial({
		color: 0x97CBFF
	}));
	smokesTack.position.set(3, 11, 0);

	var lightLeft = new THREE.Mesh(new THREE.CircleGeometry(1, 30), new THREE.MeshPhongMaterial({
		color: 0xffed80,
		side: THREE.DoubleSide
	}));
	lightLeft.position.set(7.6, 3.5, -2.5);
	lightLeft.rotation.y = Math.PI / 2;
	var lightRight = lightLeft.clone();
	lightRight.position.set(7.6, 3.5, 2.5);
	lightRight.rotation.y = Math.PI / 2;

	car.add(windscreen, licensePlate, carBody, carHead, smokesTack, lightLeft, lightRight);
	
	
	obstacles = new THREE.Object3D();
	obstacle0 = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 3, 32), new THREE.MeshPhongMaterial({
		color: 0x009100
	}));
	obstacle0.position.set(90, 1.5, -50);
	obstacle1 = obstacle0.clone();
	obstacle1.position.set(55, 1.5, -20);
	obstacle2 = obstacle0.clone();
	obstacle2.position.set(70, 1.5, 30);
	obstacle3 = obstacle0.clone();
	obstacle3.position.set(-50, 1.5, 40);
	obstacle4 = obstacle0.clone();
	obstacle4.position.set(-60, 1.5, -80);
	
	obstacles.add(obstacle0, obstacle1, obstacle2, obstacle3, obstacle4);/**/
	
	scene.add(car, obstacles);
}

function init1() {
	scene1 = new THREE.Scene();
	camera1 = new THREE.OrthographicCamera(-10.01, 10.01, 10.01, -10.01, -10, 10);
	camera1.position.z = 5;
	
	let sideLines = [];
	sideLines.push(new THREE.Vector3(-10, -10, 0),
    new THREE.Vector3(10, -10, 0),
    new THREE.Vector3(10, 10, 0),
    new THREE.Vector3(-10, 10, 0),
    new THREE.Vector3(-10, -10, 0));
	
	var lineGeometry = new THREE.BufferGeometry().setFromPoints(sideLines);
	var line = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({
		color: 0x004B97
	}));
	scene1.add(line);
}

function update(dt) {

	keyboard.update();
	
	if (vel.length() > 0) {
		angle = 1.5*Math.PI + Math.atan2(vel.x, vel.z);
	}

	if (keyboard.pressed("space"))  
		power = 0.01;               
	if (keyboard.pressed("up"))  
		power += 1.4;        
	if (keyboard.pressed("down"))  
		power -= 1.4;   
	  
	var angle_thrust = angle;
	if (keyboard.pressed("left"))
		angle_thrust += 0.5;
	if (keyboard.pressed("right"))
		angle_thrust -= 0.5;
		
	//無power = Math.clamp(power, 0.0, 80.0); 
	if (power <= -60.0)
		power = -60.0;
	if (power >= 60.0)	
		power = 60.0;
	
	// compute force (Go forward)
	if (power >= 0.00) {
		var thrust = new THREE.Vector3(1,0,0).multiplyScalar(power).applyAxisAngle(new THREE.Vector3(0,1,0), angle_thrust);
		force.copy(thrust);
		force.add(vel.clone().multiplyScalar(-2));

	// eulers
		vel.add(force.clone().multiplyScalar(dt));
		pos.add(vel.clone().multiplyScalar(dt));
	}
	
	// compute force (Go back)
	if (power <= -0.00) {
		var thrust = new THREE.Vector3(1,0,0).multiplyScalar(-power).applyAxisAngle(new THREE.Vector3(0,1,0), angle_thrust);
		force.copy(thrust);
		force.add(vel.clone().multiplyScalar(-2));

	// eulers
		vel.add(force.clone().multiplyScalar(dt));
		pos.add(vel.clone().multiplyScalar(-dt));
	}
}

function makeBoundary(car) {

	var boundary = {};
	boundary.max = car.localToWorld(new THREE.Vector3(7.5, 0, 5));
	boundary.min = car.localToWorld(new THREE.Vector3(-7.5, 0, -5));
	boundary.px = car.localToWorld(new THREE.Vector3(0.7, 0, 0)).sub(car.position);//???
	return boundary;
}

function Check_Intersect(Bound, Cyli, Rad) {

	const Rad2 = Rad * Rad;

	let xHat = Bound.px;
	let zHat = xHat.clone().cross(new THREE.Vector3(0,1,0)).normalize();

	let R = {max:{x:0, z:0}, min:{x:0, z:0}};
	let cp = Bound.max.clone().sub(Cyli.position);   
	R.max.x = cp.dot(xHat), R.max.z = cp.dot(zHat);

	cp = Bound.min.clone().sub(Cyli.position);
	R.min.x = cp.dot(xHat), R.min.z = cp.dot(zHat);

	if (R.max.x < 0) 		/* R to left of circle center */{
		if (R.max.z < 0)	/* R in lower left corner */{
			return ((R.max.x * R.max.x + R.max.z * R.max.z) < Rad2);
		}else if (R.min.z > 0) 	/* R in upper left corner */{
			return ((R.max.x * R.max.x + R.min.z * R.min.z) < Rad2);
		}else 					/* R due West of circle */{
			return(Math.abs(R.max.x) < Rad);
		}
	}else if (R.min.x > 0)  	/* R to right of circle center */{
		if (R.max.z < 0) 	/* R in lower right corner */	{
			return ((R.min.x * R.min.x + R.max.z * R.max.z) < Rad2);
		}else if (R.min.z > 0)  	/* R in upper right corner */{
			return ((R.min.x * R.min.x + R.min.z * R.min.z) < Rad2);
		}else 				/* R due East of circle */{
			return (R.min.x < Rad);
		}		
	}else				/* R on circle vertical centerline */{
		if (R.max.z < 0) 	/* R due South of circle */{
			return (Math.abs(R.max.z) < Rad);
		}else if (R.min.z > 0)  	/* R due North of circle */{
			return (R.min.z < Rad);
		}else 				/* R contains circle centerpoint */{
			return(true);	
		}		
	}	
}