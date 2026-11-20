extends Node3D

func _ready() -> void:
	var carpeta := ProjectSettings.globalize_path("res://../../dist/exportar/guatape/")
	var args := OS.get_cmdline_user_args()
	if args.size() > 0:
		carpeta = args[0]
	var escena = JSON.parse_string(FileAccess.get_file_as_string(carpeta.path_join("escena.json")))
	var alturas = JSON.parse_string(FileAccess.get_file_as_string(carpeta.path_join("alturas.json")))
	if not escena is Dictionary or not alturas is Dictionary or not escena.has("arboles") or not alturas.has("min_m"):
		push_error("Faltan los datos del exportador en " + carpeta)
		get_tree().quit(1)
		return
	var doc := GLTFDocument.new()
	var estado := GLTFState.new()
	if doc.append_from_file(carpeta.path_join("mundo.glb"), estado) != OK:
		get_tree().quit(1)
		return
	var ciudad := doc.generate_scene(estado)
	add_child(ciudad)
	var anteriores := ciudad.find_child("arboles", true, false) as Node3D
	if anteriores:
		anteriores.hide()
	var caja: Array = escena.caja
	var origen := Vector3((caja[0] + caja[2]) / 2, alturas.min_m, (caja[1] + caja[3]) / 2)
	plantar(escena.arboles, origen)
	var ancho: float = max(caja[2] - caja[0], caja[3] - caja[1])
	var camara := Camera3D.new()
	add_child(camara)
	camara.position = Vector3(ancho * 0.65, ancho * 0.75, ancho * 0.65)
	camara.look_at(Vector3(0, (alturas.max_m - alturas.min_m) * 0.5, 0))
	var sol := DirectionalLight3D.new()
	sol.rotation_degrees = Vector3(-55, -35, 0)
	add_child(sol)
	print("Guatapé: %d árboles en dos MultiMesh, %d edificios." % [escena.arboles.size(), escena.edificios.size()])

func plantar(arboles: Array, origen: Vector3) -> void:
	for copa in [false, true]:
		var lote := MultiMesh.new()
		lote.transform_format = MultiMesh.TRANSFORM_3D
		var material := StandardMaterial3D.new()
		material.albedo_color = Color("#557940") if copa else Color("#705543")
		var mesh: PrimitiveMesh = SphereMesh.new() if copa else CylinderMesh.new()
		mesh.radial_segments = 8
		if copa:
			mesh.rings = 4
		mesh.material = material
		lote.mesh = mesh
		lote.instance_count = arboles.size()
		for i in arboles.size():
			var a: Dictionary = arboles[i]
			var altura := float(a.alto)
			var radio := maxf(0.12, float(a.copa))
			var escala := Vector3(radio * 2, altura * 0.6, radio * 2) if copa else Vector3(radio * 0.18, altura * 0.32, radio * 0.18)
			var centro := Vector3(a.x, a.base + altura * (0.70 if copa else 0.32), a.y) - origen
			lote.set_instance_transform(i, Transform3D(Basis.from_scale(escala), centro))
		var instancia := MultiMeshInstance3D.new()
		instancia.multimesh = lote
		add_child(instancia)
