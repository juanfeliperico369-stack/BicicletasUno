package com.juanfeliperico.juegaencicla;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Salas por Bluetooth clásico (RFCOMM) entre celulares emparejados.
 * El anfitrión escucha y acepta hasta 3 invitados; cada invitado se conecta al anfitrión.
 * Los mensajes son líneas de texto (JSON) y llegan a la página como eventos "jeBt":
 * {k:"open", id, name} · {k:"data", id, d} · {k:"close", id}.
 */
@SuppressLint("MissingPermission")
@CapacitorPlugin(
    name = "JEBluetooth",
    permissions = { @Permission(alias = "bt", strings = { Manifest.permission.BLUETOOTH_CONNECT }) }
)
public class BluetoothPlugin extends Plugin {

    private static final UUID SERVICE = UUID.fromString("7b0f1c52-3a64-4d0e-9c1e-4a6e63696c61");
    private static final int MAX_GUESTS = 3;

    private final Map<Integer, Link> links = new ConcurrentHashMap<>();
    private final ExecutorService writer = Executors.newSingleThreadExecutor();
    private volatile BluetoothServerSocket server;
    private int nextId = 1;

    private static final class Link {
        final int id;
        final BluetoothSocket socket;
        final OutputStream out;

        Link(int id, BluetoothSocket socket) throws IOException {
            this.id = id;
            this.socket = socket;
            this.out = socket.getOutputStream();
        }
    }

    private BluetoothAdapter adapter() {
        BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        return bm == null ? null : bm.getAdapter();
    }

    /** Desde Android 12 hace falta el permiso en tiempo de ejecución. */
    private boolean allowed() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.S || getPermissionState("bt") == PermissionState.GRANTED;
    }

    /** Devuelve el adaptador listo, o rechaza la llamada con un mensaje para el jugador. */
    private BluetoothAdapter ready(PluginCall call) {
        BluetoothAdapter a = adapter();
        if (a == null) {
            call.reject("Este celular no tiene Bluetooth.");
            return null;
        }
        if (!a.isEnabled()) {
            try {
                Intent i = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
            } catch (Exception ignored) {
                // sin pantalla del sistema: el mensaje basta
            }
            call.reject("Enciende el Bluetooth y vuelve a intentarlo.");
            return null;
        }
        return a;
    }

    private void emit(String kind, int id, String name, String data) {
        JSObject o = new JSObject();
        o.put("k", kind);
        o.put("id", id);
        if (name != null) o.put("name", name);
        if (data != null) o.put("d", data);
        bridge.triggerWindowJSEvent("jeBt", o.toString());
    }

    private void open(int id, BluetoothSocket socket) throws IOException {
        Link link = new Link(id, socket);
        links.put(id, link);
        String name = null;
        try {
            name = socket.getRemoteDevice().getName();
        } catch (Exception ignored) {
            // el nombre es opcional
        }
        emit("open", id, name, null);
        Thread t = new Thread(() -> read(link), "je-bt-read-" + id);
        t.setDaemon(true);
        t.start();
    }

    private void read(Link link) {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(link.socket.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = in.readLine()) != null) {
                if (!line.isEmpty()) emit("data", link.id, null, line);
            }
        } catch (IOException ignored) {
            // conexión cerrada
        }
        drop(link.id);
    }

    private void drop(int id) {
        Link link = links.remove(id);
        if (link == null) return;
        try {
            link.socket.close();
        } catch (IOException ignored) {
            // ya estaba cerrada
        }
        emit("close", id, null, null);
    }

    private void closeAll() {
        BluetoothServerSocket s = server;
        server = null;
        if (s != null) {
            try {
                s.close();
            } catch (IOException ignored) {
                // ya estaba cerrado
            }
        }
        for (Integer id : links.keySet()) drop(id);
    }

    @PluginMethod
    public void available(PluginCall call) {
        BluetoothAdapter a = adapter();
        JSObject r = new JSObject();
        r.put("ok", a != null);
        r.put("enabled", a != null && allowed() && a.isEnabled());
        call.resolve(r);
    }

    @PluginMethod
    public void host(PluginCall call) {
        if (!allowed()) {
            requestPermissionForAlias("bt", call, "hostAllowed");
            return;
        }
        startHost(call);
    }

    @PermissionCallback
    private void hostAllowed(PluginCall call) {
        if (allowed()) startHost(call);
        else call.reject("Falta el permiso de dispositivos cercanos (Bluetooth).");
    }

    private void startHost(PluginCall call) {
        BluetoothAdapter a = ready(call);
        if (a == null) return;
        closeAll();
        final BluetoothServerSocket s;
        try {
            s = a.listenUsingRfcommWithServiceRecord("JuegaEnCicla", SERVICE);
        } catch (IOException | SecurityException e) {
            call.reject("No se pudo abrir la sala por Bluetooth.");
            return;
        }
        server = s;
        nextId = 1;
        Thread t = new Thread(() -> {
            while (server == s) {
                try {
                    BluetoothSocket socket = s.accept();
                    if (links.size() >= MAX_GUESTS) {
                        socket.close();
                        continue;
                    }
                    open(nextId++, socket);
                } catch (IOException e) {
                    break;
                }
            }
        }, "je-bt-accept");
        t.setDaemon(true);
        t.start();
        JSObject r = new JSObject();
        r.put("name", a.getName());
        call.resolve(r);
    }

    @PluginMethod
    public void devices(PluginCall call) {
        if (!allowed()) {
            requestPermissionForAlias("bt", call, "devicesAllowed");
            return;
        }
        listDevices(call);
    }

    @PermissionCallback
    private void devicesAllowed(PluginCall call) {
        if (allowed()) listDevices(call);
        else call.reject("Falta el permiso de dispositivos cercanos (Bluetooth).");
    }

    private void listDevices(PluginCall call) {
        BluetoothAdapter a = ready(call);
        if (a == null) return;
        JSArray list = new JSArray();
        for (BluetoothDevice d : a.getBondedDevices()) {
            JSObject o = new JSObject();
            o.put("name", d.getName());
            o.put("address", d.getAddress());
            list.put(o);
        }
        JSObject r = new JSObject();
        r.put("devices", list);
        call.resolve(r);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        final String address = call.getString("address");
        if (address == null || !BluetoothAdapter.checkBluetoothAddress(address)) {
            call.reject("Dispositivo no válido.");
            return;
        }
        if (!allowed()) {
            call.reject("Falta el permiso de dispositivos cercanos (Bluetooth).");
            return;
        }
        final BluetoothAdapter a = ready(call);
        if (a == null) return;
        closeAll();
        Thread t = new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                a.cancelDiscovery();
                socket = a.getRemoteDevice(address).createRfcommSocketToServiceRecord(SERVICE);
                socket.connect();
                open(0, socket);
                call.resolve();
            } catch (IOException | SecurityException e) {
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (IOException ignored) {
                        // ya estaba cerrada
                    }
                }
                call.reject("No se pudo conectar. Verifica que la sala esté abierta en el otro celular y que estén emparejados.");
            }
        }, "je-bt-connect");
        t.setDaemon(true);
        t.start();
    }

    @PluginMethod
    public void send(PluginCall call) {
        final Integer id = call.getInt("id");
        final String data = call.getString("data");
        final Link link = id == null ? null : links.get(id);
        if (link == null || data == null) {
            call.reject("Sin conexión.");
            return;
        }
        writer.execute(() -> {
            try {
                link.out.write((data + "\n").getBytes(StandardCharsets.UTF_8));
                link.out.flush();
            } catch (IOException e) {
                drop(link.id);
            }
        });
        call.resolve();
    }

    @PluginMethod
    public void close(PluginCall call) {
        Integer id = call.getInt("id");
        if (id != null) drop(id);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        closeAll();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        closeAll();
        writer.shutdownNow();
    }
}
