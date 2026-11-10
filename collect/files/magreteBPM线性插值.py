#BPM	1920	75.00000
#       ↑单位是1920分音
#（这是你mgxc文件里面BPM部分写的东西）

start=int(input("start:"))#起始时间，单位1920分音，去你mgxc里面查
end=int(input("end:"))#结束时间，同上
delta=float(input("delta:"))#BPM改变值
BPM=float(input("BaseBPM:"))#初始BPM
sep=int(input("seperate:"))#每个几分音插一个值，例如96就是每个96分音插一个值

upd=(1920/sep)*delta/(end-start)

start+=1920/sep
while (start<end):
    BPM+=upd    
    print("BPM	%d	%.5lf" %(start,BPM))
    start+=1920/sep

#使用建议：先在magrete里面把开头结尾标上起始和终止BPM
#（因为这个代码不会输出起始和终止）
