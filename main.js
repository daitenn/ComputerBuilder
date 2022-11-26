class PC {
  constructor(cpu, gpu, ram, storage) {
    this.count = 1;
    this.cpu = cpu;
    this.gpu = gpu;
    this.ram = ram;
    this.storage = storage;
  }

  static gamingScore(getCpu, getGpu, getRam, getStorage) {
    const cpuScore = parseInt(getCpu.benchMark * 0.25);
    const gpuScore = parseInt(getGpu.benchMark * 0.6);
    const ramScore = parseInt(getRam.benchMark * 0.125);
    const storageScore = getStorage.type === "ssd" ? parseInt(getStorage.benchMark * 0.1) : parseInt(getStorage.benchMark * 0.025);
    const gamingScore = cpuScore + gpuScore + ramScore + storageScore;
    return gamingScore;
  }

  static workingScore(getCpu, getGpu, getRam, getStorage) {
    const cpuScore = parseInt(getCpu.benchMark * 0.6);
    const gpuScore = parseInt(getGpu.benchMark * 0.25);
    const ramScore = parseInt(getRam.benchMark * 0.1);
    const storageScore = parseInt(getStorage.benchMark * 0.05);
    const workingScore = cpuScore + gpuScore + ramScore + storageScore;
    return workingScore;
  }
}

class Parts {
  constructor(part) {
    this.type = part;
    this.brand = null;
    this.model = null;
    this.benchMark = null;
    this.size = null;
  }

  static addBrand(newBrand, parts) {
    parts.brand = newBrand;
  }

  static addModel(newModel, parts) {
    parts.model = newModel;
  }

  static addStorageType(newStorageType, storage) {
    storage.type = newStorageType;
  }

  static addStorageSize(newStorageSize, storage) {
    storage.size = newStorageSize;
  }

  static addBenchMark(newBenchMark, parts) {
    parts.benchMark = newBenchMark;
  }

}

const config = {
  url: "https://api.recursionist.io/builder/computers?type=",
  cpuBrand: "cpu-Brand",
  cpuModel: "cpu-Model",
  gpuBrand: "gpu-Brand",
  gpuModel: "gpu-Model",
  ramQuantity: "ram-Quantity",
  ramBrand: "ram-Brand",
  ramModel: "ram-Model",
  storageSize: "storage-size",
  storageType: "storage-type",
  storageBrand: "storage-Brand",
  storageModel: "storage-Model",
}

class Controller {
  static buildingPC() {
    const cpu = new Parts("cpu");
    const cpuBrand = document.getElementById(config.cpuBrand);
    const cpuModel = document.getElementById(config.cpuModel);
    Controller.getBrand(cpuBrand, cpuModel, cpu);

    const gpu = new Parts("gpu");
    const gpuBrand = document.getElementById(config.gpuBrand);
    const gpuModel = document.getElementById(config.gpuModel);
    Controller.getBrand(gpuBrand, gpuModel, gpu);

    const ram = new Parts("ram");
    const ramBrand = document.getElementById(config.ramBrand);
    const ramModel = document.getElementById(config.ramModel);
    Controller.getRam(ramBrand, ramModel, ram);

    const storage = new Parts("storage");
    const storageBrand = document.getElementById(config.storageBrand);
    const storageModel = document.getElementById(config.storageModel);
    const storageType = document.getElementById(config.storageType);
    const storageSize = document.getElementById(config.storageSize);
    Controller.getStorage(storageBrand, storageModel, storageType, storageSize, storage);

    const pc = new PC(cpu, gpu, ram, storage);
    return pc;
  }

  static getBrand(brand, model, part) {
    fetch(config.url + part.type)
      .then(response => response.json())
      .then(data => {
        const selctBrand = Controller.setSelectBrand(data);
        Controller.createSelectBrand(selctBrand, brand);
      })
    brand.addEventListener("change", function () {
      Parts.addBrand(brand.value, part);
      Controller.getModel(model, part)
    })
  }

  static getModel(model, part) {
    fetch(config.url + part.type)
      .then(response => response.json())
      .then(data => {
        const selctModel = Controller.setSelectModel(data);
        Controller.createSelectModel(selctModel, model, part);

      })
    model.addEventListener("change", function () {
      Parts.addModel(model.value, part);
      Controller.getBenchMark(part)
    })
  }

  static getRam(ramBrand, ramModel, ram) {
    const ramQuantity = document.getElementById(config.ramQuantity);
    ramQuantity.addEventListener("change", function () {
      Controller.getBrand(ramBrand, ramModel, ram);
    })
  }

  static getStorage(storageBrand, storageModel, storageType, storageSize, storage) {
    storageType.addEventListener("change", function () {
      Parts.addStorageType(storageType.value, storage);
      storageBrand.innerHTML = `<option value="">-</option>`;
      fetch(config.url + storageType.value)
        .then(response => response.json())
        .then(data => {
          const selectStorageSize = Controller.getStorageSize(data);
          Controller.createSelectStorage(selectStorageSize, storageSize);
        })
    })
    storageSize.addEventListener("change", function () {
      Controller.getBrand(storageBrand, storageModel, storage);
      Parts.addStorageSize(storageSize.value, storage);
    })
  }

  static getStorageSize(data) {
    let sizeTB = [];
    let sizeGB = [];
    for (let info of data) {
      if (info["Model"].indexOf("TB") !== -1) {
        const stringTB = info["Model"].match(/\d*[TB]B/g)[0];
        const size = parseInt(stringTB.replace('TB', ''))
        sizeTB.push(size);
      }
      if (info["Model"].indexOf("GB") !== -1) {
        const stringGB = info["Model"].match(/\d*[GB]B/g)[0];
        const size = parseInt(stringGB.replace('GB', ''))
        sizeGB.push(size);
      }
    }
    sizeTB = new Set(sizeTB);
    sizeGB = new Set(sizeGB);

    sizeTB = Array.from(sizeTB).sort((a, b) => b - a);
    sizeGB = Array.from(sizeGB).sort((a, b) => b - a);

    sizeTB = sizeTB.map(n => String(n) + "TB");
    sizeGB = sizeGB.map(n => String(n) + "GB");
    console.log(sizeGB);
    return sizeTB.concat(sizeGB);
  }


  // 非同期処理
  static async getBenchMark(part) {
    const data = await (await fetch(config.url + part.type)).json();
    const benchMark = Controller.setBenchMark(data, part);
    Parts.addBenchMark(benchMark, part);
  }


  static setSelectBrand(arr) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      res.push(arr[i].Brand);
    }
    const brand = new Set(res);
    return brand;
  }

  static setSelectModel(arr) {
    let model = {};
    for (let i in arr) {
      if (model[arr[i].Brand] == undefined) model[arr[i].Brand] = [arr[i].Model];
      else model[arr[i].Brand].push(arr[i].Model);
    }
    return model;
  }

  static setBenchMark(data, part) {
    let benchmark = 0;
    for (let info of data) {
      if (info["Brand"] === part.brand) {
        if (info["Model"] === part.model) {
          benchmark = parseInt(info["Benchmark"]);
          break;
        }
      }
    }
    return benchmark;
  }

  static createSelectBrand(parts, brand) {
    brand.innerHTML = `<option value="">-</option>`
    for (let part of parts) {
      brand.innerHTML +=
        `
			<option value=${part}>${part}</option>
			`
    }
    return brand;
  }

  static createSelectModel(parts, model, cpu) {
    model.innerHTML = `<option value="">-</option>`
    if (cpu.brand == null) return;
    const ramQuantity = document.getElementById(config.ramQuantity);
    for (let part of parts[cpu.brand]) {
      if (cpu.type === "ram" && part.indexOf(ramQuantity.value) === -1) continue;
      model.innerHTML +=
        `
			<option value="${part}">${part}</option>
			`
    }
    return model;
  }

  static createSelectStorage(parts, storage) {
    storage.innerHTML = `<option value="">-</option>`
    for (let part of parts) {
      if (part.indexOf(storage.value) === null) continue;
      storage.innerHTML +=
        `
			<option value=${part}>${part}</option>
			`
    }
    return storage;
  }

  static isFullInput(pc) {
    if (pc["cpu"].brand == null || pc["cpu"].model == null) return false;
    else if (pc["gpu"].brand == null || pc["gpu"].model == null) return false;
    else if (pc["ram"].brand == null || pc["ram"].model == null) return false;
    else if (pc["storage"].brand == null || pc["storage"].model == null || pc["storage"].type == "storage" || pc["storage"].size == null) return false;
    return true;
  }
}

class View {
  static createPC() {
    const target = document.getElementById("target");
    const add = document.getElementById("add");
    const pc = Controller.buildingPC();
    add.addEventListener("click", function () {
      if (Controller.isFullInput(pc)) {
        const div = document.createElement("div");
        div.classList.add("d-flex", "align-items-center", "justify-content-center", "rounded-3")
        div.innerHTML =
          `
				<div class="card bg-white col-6 my-4 ">
					<div class="test-blue text-center p-4">
						<div class="d-flex flex-row justify-content-around">
							<div class="border-radius pt-2">
								<h4>PC ${pc.count++}</h4>
							</div>
							<div class="pt-2">
								<h4>Gaming<p>${PC.gamingScore(pc["cpu"], pc["gpu"], pc["ram"], pc["storage"])}%</p></h4>
							</div>
							<div class="pt-2">
								<h4>Working<p>${PC.workingScore(pc["cpu"], pc["gpu"], pc["ram"], pc["storage"])}%</p></h4>
							</div>
						</div>
						<div class="d-flex flex-row justify-content-between">
							<div>
								<h4>CPU</h4>
								<p>Brand: ${pc["cpu"].brand}</p>
								<p>Model: ${pc["cpu"].model}</p>
							</div>
							<div>
								<h4>GPU</h4>
								<p>Brand: ${pc["gpu"].brand}</p>
								<p>Model: ${pc["gpu"].model}</p>
							</div>
							<div>
								<h4>RAM</h4>
								<p>Brand: ${pc["ram"].brand}</p>
								<p>Model: ${pc["ram"].model}</p>
							</div>
							<div>
								<h4>${pc["storage"].type.toUpperCase()}</h4>
								<p>Brand: ${pc["storage"].brand}</p>
								<p>Model: ${pc["storage"].model}</p>
								<p>Size: ${pc["storage"].size}</p>
							</div>
						</div>
					</div>
				</div>
				`
        target.append(div);
      }
      else alert("Please fill in all forms.");
    })
  }
}
View.createPC();
