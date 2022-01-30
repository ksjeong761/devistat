#!/usr/bin/python
import psutil
import time
import json
from collections import OrderedDict

#[TODO]
#고정값은 프로그램 실행할 때 얻어오고 주기적으로 보낼 때는 제외하기
#예외 처리(센서 등 github 참고)
#유니코드 처리 (네트워크, 서비스)

class DeviceStatus:
    def __init__(self):
        self.cpu = self.Cpu()
        self.memory = self.Memory()
        self.disk = self.Disk()
        self.network = self.Network()
        self.sensor = self.Sensor()
        self.timeSpent = self.TimeSpent()
        self.user = self.User()
        self.process = self.Process()
        self.win_service = self.WinService()
        return

    class Cpu:
        def __init__(self):
            self.cpu_times = psutil.cpu_times(percpu=False) #계속 누적되는 데이터라서 가공 필요
            self.cpu_stats = psutil.cpu_stats() #계속 누적되는 데이터라서 가공 필요
            self.cpu_loadavg = OrderedDict(zip(['minute_5', 'minute_10', 'minute_15'], psutil.getloadavg()))
            self.cpu_percent = psutil.cpu_percent(interval=None, percpu=False)
            self.cpu_times_percent = psutil.cpu_times_percent(interval=None, percpu=False)
            self.cpu_count = psutil.cpu_count(logical=True) #고정값
            self.cpu_freq = psutil.cpu_freq(percpu=False)
            return

    class Memory:
        def __init__(self):
            self.virtual_memory = psutil.virtual_memory()
            self.swap_memory = psutil.swap_memory() # total이 used보다 작게 나와서 버그생김
            return

    class Disk:
        def __init__(self):
            self.partitions = [p for p in psutil.disk_partitions(all=False)] #고정값
            self.disk_usage = psutil.disk_usage('/')
            self.disk_io_counters = psutil.disk_io_counters(perdisk=False, nowrap=True)
            return

    class Network:
        def __init__(self):
            self.net_io_counters = psutil.net_io_counters(pernic=False, nowrap=True)
            self.net_connections = psutil.net_connections(kind='inet')
            self.net_if_addrs = psutil.net_if_addrs() #고정값 네트워크 정보는 고정되어 있는 경우가 대부분이지만 바뀔 수도 있음
            self.net_if_stats = psutil.net_if_stats() #유니코드 문자 처리 해야됨
            return

    class Sensor:
        def __init__(self):
            #self.sensors_temperatures = psutil.sensors_temperatures(fahrenheit=False) # 감지 안 됨
            #self.sensors_fans = psutil.sensors_fans() # 감지 안 됨
            self.sensors_battery = psutil.sensors_battery() #노트북에선 되는데 배터리 없을 경우 테스트 필요
            return

    class TimeSpent:
        def __init__(self):
            self.boot_time = psutil.boot_time()
            return

    class User:
        def __init__(self):
            self.users = psutil.users()
            return

    class Process:
        def __init__(self):
            self.processes = [p for p in psutil.process_iter()]
            return
    
    class WinService:
        def __init__(self):
            self.services = [p for p in psutil.win_service_iter()] #유니코드 문자 처리 해야됨
            return

def namedtuple_asdict(obj):
    print(obj)
    if hasattr(obj, "_asdict"): # detect namedtuple
        return OrderedDict(zip(obj._fields, (namedtuple_asdict(item) for item in obj)))
    elif isinstance(obj, str): # iterables - strings
        return obj
    elif hasattr(obj, "keys"): # iterables - mapping
        return OrderedDict(zip(obj.keys(), (namedtuple_asdict(item) for item in obj.values())))
    elif hasattr(obj, "__iter__"): # iterables - sequence
        return type(obj)((namedtuple_asdict(item) for item in obj))
    else: # non-iterable cannot contain namedtuples
        return obj.__dict__

d = DeviceStatus()
print(json.dumps(d.cpu, default=lambda x: namedtuple_asdict(x), indent=4))
#print(json.dumps(d.memory, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.disk, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.network, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.sensor, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.timeSpent, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.user, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.process, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))
#print(json.dumps(d.win_service, default=lambda x: namedtuple_asdict(x.__dict__), indent=4))